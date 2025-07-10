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
    }

    /**
     * Auto-detect exam folders and load all data
     */
    async autoLoadAllExams() {
      
        
        try {
            // Load all exam types automatically
            await this.loadWhizlabsExams();
            await this.loadExamTopicsExams();
            await this.loadPMAExams();
            await this.loadFreecamsExams();
            
    
            this.notifyExamDataLoaded();
        } catch (error) {
            console.error('❌ Error loading exam data:', error);
        }
    }

    /**
     * Load Whizlabs exam data
     */
    async loadWhizlabsExams() {
        const whizlabsExams = ['SAP-C02'];
        
        for (const exam of whizlabsExams) {
            await this.loadExamFromPath(`${this.basePaths.whizlabs}/${exam}`);
        }
    }

    /**
     * Load ExamTopics exam data
     */
    async loadExamTopicsExams() {
        const examTopicsExams = [
            'SAP-C01', 'SAP-C02', 'SOA-C02', 'SAA-C03', 
            'DBS-C01', 'DOP-C01', 'DVA-C01', 'DVA-C02',
            'PMI-PMP', 'SNC-CAD'
        ];
        
        for (const exam of examTopicsExams) {
            await this.loadExamFromPath(`${this.basePaths.examtopics}/${exam}`);
        }
    }

    /**
     * Load PMA exam data
     */
    async loadPMAExams() {
        const pmaFolders = ['final_exam', 'mock_test'];
        
        for (const folder of pmaFolders) {
            await this.loadExamFromPath(`${this.basePaths.pma}/${folder}`);
        }
    }

    /**
     * Load Freecams exam data
     */
    async loadFreecamsExams() {
        const freecamsExams = ['SAP-C01'];
        
        for (const exam of freecamsExams) {
            await this.loadExamFromPath(`${this.basePaths.freecams}/${exam}`);
        }
    }

    /**
     * Load all files from a specific exam path
     */
    async loadExamFromPath(examPath) {
        try {
            // Try to fetch the directory listing (if server supports it)
            const response = await fetch(`${examPath}/index.json`);
            if (response.ok) {
                const fileList = await response.json();
                await this.loadFilesFromList(examPath, fileList);
            } else {
                // Fallback: load based on common patterns
                await this.loadFilesByPattern(examPath);
            }
        } catch (error) {
            // console.warn(`Could not auto-detect files for ${examPath}, using pattern-based loading`);
            await this.loadFilesByPattern(examPath);
        }
    }

    /**
     * Load files from a predefined list
     */
    async loadFilesFromList(basePath, fileList) {
        for (const file of fileList) {
            if (file.endsWith('.js')) {
                await this.loadScript(`${basePath}/${file}`);
            }
        }
    }

    /**
     * Load files based on common naming patterns
     */
    async loadFilesByPattern(basePath) {
        const patterns = this.getFilePatterns(basePath);
        
        for (const pattern of patterns) {
            await this.loadScript(`${basePath}/${pattern}.js`);
        }
    }

    /**
     * Get file patterns based on exam type
     */
    getFilePatterns(basePath) {
        const pathParts = basePath.split('/');
        const examType = pathParts[pathParts.length - 1];
        const sourceType = pathParts[pathParts.length - 2];
        
        const patterns = {
            'examtopics': {
                'SAP-C01': ['exam_001_100', 'exam_101_200', 'exam_201_300', 'exam_301_400', 'exam_400_499', 'exam_500_599', 'exam_600_699', 'exam_700_799', 'exam_800_899', 'exam_900_1027'],
                'SAP-C02': ['sap_c02_part1', 'sap_c02_part2', 'sap_c02_all'],
                'SOA-C02': ['soa_c02_exam_001_050', 'soa_c02_exam_051_099', 'soa_c02_exam_extra_1', 'soa_c02_part1', 'soa_c02_part2', 'soa_c02_part3'],
                'SAA-C03': ['saa_c03_exam_001_100', 'saa_c03_exam_101_200', 'saa_c03_exam_201_300', 'saa_c03_exam_301_400', 'saa_c03_exam_401_500', 'saa_c03_exam_501_600'],
                'DBS-C01': ['dbs_c01_part1', 'dbs_c01_part2', 'dbs_c01_part3'],
                'DOP-C01': ['dop_c01_part1', 'dop_c01_part2', 'dop_c01_part3', 'dop_c01_part4', 'dop_c01_part5', 'dop_c01_part6'],
                'DVA-C01': ['dva_c01_part1', 'dva_c01_part2', 'dva_c01_part3', 'dva_c01_part4', 'dva_c01_part5', 'dva_c01_part6'],
                'DVA-C02': ['dva_c02_part1', 'dva_c02_part2', 'dva_c02_part3', 'dva_c02_part4', 'dva_c02_part5', 'dva_c02_part6'],
                'PMI-PMP': ['pmi_pmp_part1', 'pmi_pmp_part2', 'pmi_pmp_part3', 'pmi_pmp_part4', 'pmi_pmp_part5', 'pmi_pmp_part6', 'pmi_pmp_part7', 'pmi_pmp_part8'],
                'SNC-CAD': ['snc_cad_part1', 'snc_cad_part2', 'snc_cad_part3', 'snc_cad_part_all']
            },
            'pma': {
                'final_exam': ['final_exam_part1', 'final_exam_part2', 'final_exam_part3'],
                'mock_test': ['mock_test1', 'mock_test2']
            },
            'freecams': {
                'SAP-C01': ['Amazon.SAP-C01.v2022-08-26.q100']
            }
        };
        
        if (patterns[sourceType] && patterns[sourceType][examType]) {
            return Array.isArray(patterns[sourceType][examType]) 
                ? patterns[sourceType][examType] 
                : patterns[sourceType][examType];
        }
        
        return [];
    }

    /**
     * Load a single script file
     */
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            if (this.loadedExams.has(src)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                this.loadedExams.add(src);
        
                resolve();
            };
            
            script.onerror = () => {
                console.warn(`⚠️ Failed to load: ${src}`);
                reject(new Error(`Failed to load: ${src}`));
            };
            
            document.body.appendChild(script);
        });
    }

    /**
     * Notify that exam data has been loaded
     */
    notifyExamDataLoaded() {
        // Dispatch custom event to notify other parts of the application
        const event = new CustomEvent('examDataLoaded', {
            detail: {
                loadedExams: Array.from(this.loadedExams),
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
            percentage: 100
        };
    }

    /**
     * Check if specific exam is loaded
     */
    isExamLoaded(examPath) {
        return Array.from(this.loadedExams).some(path => path.includes(examPath));
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