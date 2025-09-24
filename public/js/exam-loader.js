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
                    'ServiceNow_CAD': 'SNC-CAD',
                    'SOA_C02': 'SOA-C02',
                    'SAA_C03': 'SAA-C03',
                    'DVA_C01': 'DVA-C01',
                    'DVA_C02': 'DVA-C02',
                    'SAP_C01': 'SAP-C01',
                    'SAP_C02': 'SAP-C02',
                    'DOP_C01': 'DOP-C01',
                    'DBS_C01': 'DBS-C01',
                    'PMI_PMP': 'PMI-PMP',
                    'PMA_Mock_test': 'mock_test',
                    'PMA_Full_exam_1': 'full_exam_1',
                    'PMA_PMP': 'final_exam'
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

    /**
     * Auto-detect exam folders and load all data
     */
    async autoLoadAllExams() {
        try {
            // Load all active exam data files first
            await this.loadAllActiveExamData();
            
            this.notifyExamDataLoaded();
        } catch (error) {
            console.error('❌ Error loading exam data:', error);
        }
    }

    /**
     * Load all active exam data files
     */
    async loadAllActiveExamData() {
        // Define active exams based on the current configuration
        const activeExams = [
            'examtopics/PMI-PMP',
            'pma/final_exam',
            'pma/full_exam_1',
            'pma/mock_test'
        ];
        
        for (const examPath of activeExams) {
            const [sourceType, examName] = examPath.split('/');
            const fullPath = `${this.basePaths[sourceType]}/${examName}`;
            
            await this.loadExamFromPath(fullPath);
        }
        
        this.activeExams = new Set(activeExams);
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
        for (const file of fileList.files || fileList) {
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
                'mock_test': ['mock_test1', 'mock_test2', 'mock_test3', 'mock_test4', 'mock_test5', 'mock_test6', 'mock_test7', 'mock_test8', 'mock_test9', 'mock_test10', 'mock_test11', 'mock_test12', 'mock_test13', 'mock_test14'],
                'full_exam_1': ['full_exam_part1', 'full_exam_part2', 'full_exam_part3']
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