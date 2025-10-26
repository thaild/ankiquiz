/**
 * Advanced Exam Data Loader
 * Automatically detects and loads exam data from folders
 */

class ExamDataLoader {
  constructor() {
    this.loadedExams = new Set();
    this.examStructure = {};
    this.basePaths = {
      whizlabs: './public/data/whizlabs',
      examtopics: './public/data/examtopics',
      pma: './public/data/pma',
      freecams: './public/data/freecams'
    };
    this.activeExams = new Set(); // Track active exams
  }

  /**
   * Get active exams from listExamGroup
   */
  getActiveExams() {
    if (!window.listExamGroup) {
      console.warn('⚠️ listExamGroup not available yet, will retry');
      return new Set();
    }

    const activeExams = new Set();

    window.listExamGroup.forEach(group => {
      if (group.active) {
        // Map group IDs to folder names
        const folderMapping = {
          ServiceNow_CAD: 'SNC-CAD',
          SOA_C02: 'SOA-C02',
          SAA_C03: 'SAA-C03',
          DVA_C01: 'DVA-C01',
          DVA_C02: 'DVA-C02',
          SAP_C01: 'SAP-C01',
          SAP_C02: 'SAP-C02',
          DOP_C01: 'DOP-C01',
          DBS_C01: 'DBS-C01',
          PMI_PMP: 'PMI-PMP',
          PMA_Mock_test: 'mock_test',
          PMA_MINI_TEST: 'mini_test',
          PMA_Full_exam_1: 'full_exam_1',
          PMA_PMP: 'final_exam'
        };

        const folderName = folderMapping[group.id];
        if (folderName) {
          // Determine the source type based on group ID
          let sourceType = 'examtopics'; // default
          if (group.id.startsWith('PMA_')) {
            sourceType = 'pma';
          } else if (group.id.includes('Whiz_')) {
            sourceType = 'whizlabs';
          } else if (group.id.includes('Free_')) {
            sourceType = 'freecams';
          }

          activeExams.add(`${sourceType}/${folderName}`);
        }
      }
    });

    return activeExams;
  }

  autoLoadAllExams() {
    try {
      // Load all active exam data files first
      this.loadAllActiveExamData();

      this.notifyExamDataLoaded();
    } catch (error) {
      console.error('❌ Error loading exam data:', error);
    }
  }

  /**
   * Load all active exam data files
   */
  loadAllActiveExamData() {
    // Define active exams based on the current configuration
    const activeExams = [
      'examtopics/PMI-PMP',
      'pma/final_exam',
      'pma/full_exam_1',
      'pma/mock_test',
      'pma/mini_test'
    ];

    for (const examPath of activeExams) {
      const [sourceType, examName] = examPath.split('/');
      const fullPath = `${this.basePaths[sourceType]}/${examName}`;

      this.loadExamFromPath(fullPath);
    }

    this.activeExams = new Set(activeExams);
  }

  /**
   * Load all files from a specific exam path
   */
  loadExamFromPath(examPath) {
    try {
      // Try to fetch the directory listing (if server supports it)
      fetch(`${examPath}/index.json`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to fetch index.json');
        })
        .then(fileList => {
          this.loadFilesFromList(examPath, fileList);
        })
        .catch(() => {
          console.warn(`Could not load files from ${examPath}`);
        });
    } catch (error) {
      console.warn(`Could not auto-detect files for ${examPath}:`, error);
    }
  }

  /**
   * Load files from a predefined list
   */
  loadFilesFromList(basePath, fileList) {
    for (const file of fileList.files || fileList) {
      if (file.endsWith('.js')) {
        this.loadScript(`${basePath}/${file}`);
      }
    }
  }

  /**
   * Load a single script file
   */
  loadScript(src) {
    if (this.loadedExams.has(src)) {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      this.loadedExams.add(src);
    };

    script.onerror = () => {
      console.warn(`⚠️ Failed to load: ${src}`);
    };

    document.body.appendChild(script);
  }

  /**
   * Notify that exam data has been loaded
   */
  notifyExamDataLoaded() {
    // Dispatch custom event to notify other parts of the application
    const event = new CustomEvent('examDataLoaded', {
      detail: {
        loadedExams: Array.from(this.loadedExams),
        activeExams: Array.from(this.activeExams),
        timestamp: new Date().toISOString()
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get loading progress
   */
  getLoadingProgress() {
    return {
      total: this.loadedExams.size,
      loaded: this.loadedExams.size,
      percentage: 100,
      activeExams: Array.from(this.activeExams)
    };
  }

  /**
   * Check if specific exam is loaded
   */
  isExamLoaded(examPath) {
    return Array.from(this.loadedExams).some(path => path.includes(examPath));
  }

  /**
   * Check if an exam is active
   */
  isExamActive(examPath) {
    return this.activeExams.has(examPath);
  }
}

// Auto-initialize the loader
const examLoader = new ExamDataLoader();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExamDataLoader;
} else {
  window.ExamDataLoader = ExamDataLoader;
  window.examLoader = examLoader;
}
