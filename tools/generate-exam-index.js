/**
 * Exam Index Generator
 * Automatically generates index.json files for exam folders
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExamIndexGenerator {
    constructor() {
        this.baseDir = './public/data';
        this.examTypes = {
            whizlabs: ['SAP-C02'],
            examtopics: ['SAP-C01', 'SAP-C02', 'SOA-C02', 'SAA-C03', 'DBS-C01', 'DOP-C01', 'DVA-C01', 'DVA-C02', 'PMI-PMP', 'SNC-CAD'],
            pma: ['final_exam', 'mock_test', 'full_exam_1', 'mini_test'],
            freecams: ['SAP-C01']
        };
    }

    /**
     * Generate index files for all exam folders
     */
    async generateAllIndexes() {
        console.log('🔧 Generating exam index files...');
        
        for (const [sourceType, exams] of Object.entries(this.examTypes)) {
            for (const exam of exams) {
                await this.generateIndexForExam(sourceType, exam);
            }
        }
        
        console.log('✅ All index files generated successfully!');
    }

    /**
     * Generate index for a specific exam
     */
    async generateIndexForExam(sourceType, examName) {
        const examPath = path.join(this.baseDir, sourceType, examName);
        
        if (!fs.existsSync(examPath)) {
            console.warn(`⚠️ Exam path does not exist: ${examPath}`);
            return;
        }

        try {
            const files = await this.scanExamDirectory(examPath);
            const indexData = {
                exam: examName,
                source: sourceType,
                files: files,
                generated: new Date().toISOString(),
                totalFiles: files.length
            };

            const indexPath = path.join(examPath, 'index.json');
            fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
            
            console.log(`✅ Generated index for ${sourceType}/${examName}: ${files.length} files`);
        } catch (error) {
            console.error(`❌ Error generating index for ${sourceType}/${examName}:`, error);
        }
    }

    /**
     * Scan exam directory for JavaScript files
     */
    async scanExamDirectory(examPath) {
        const files = [];
        
        try {
            const items = fs.readdirSync(examPath);
            
            for (const item of items) {
                const itemPath = path.join(examPath, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    // Recursively scan subdirectories
                    const subFiles = await this.scanExamDirectory(itemPath);
                    files.push(...subFiles.map(file => `${item}/${file}`));
                } else if (item.endsWith('.js')) {
                    files.push(item);
                }
            }
        } catch (error) {
            console.warn(`⚠️ Could not scan directory: ${examPath}`, error);
        }
        
        return files.sort();
    }

    /**
     * Generate a master index file
     */
    async generateMasterIndex() {
        const masterIndex = {
            generated: new Date().toISOString(),
            examTypes: {},
            statistics: {
                totalExams: 0,
                totalFiles: 0
            }
        };

        for (const [sourceType, exams] of Object.entries(this.examTypes)) {
            masterIndex.examTypes[sourceType] = {};
            
            for (const exam of exams) {
                const indexPath = path.join(this.baseDir, sourceType, exam, 'index.json');
                
                if (fs.existsSync(indexPath)) {
                    try {
                        const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
                        masterIndex.examTypes[sourceType][exam] = {
                            files: indexData.files,
                            totalFiles: indexData.totalFiles
                        };
                        masterIndex.statistics.totalFiles += indexData.totalFiles;
                    } catch (error) {
                        console.warn(`⚠️ Could not read index for ${sourceType}/${exam}:`, error);
                    }
                }
            }
            
            masterIndex.statistics.totalExams += Object.keys(masterIndex.examTypes[sourceType]).length;
        }

        const masterIndexPath = path.join(this.baseDir, 'master-index.json');
        fs.writeFileSync(masterIndexPath, JSON.stringify(masterIndex, null, 2));
        
        console.log('✅ Master index generated successfully!');
        console.log(`📊 Statistics: ${masterIndex.statistics.totalExams} exams, ${masterIndex.statistics.totalFiles} files`);
    }

    /**
     * Watch for new exam files and regenerate indexes
     */
    watchForChanges() {
        console.log('👀 Watching for exam file changes...');
        
        fs.watch(this.baseDir, { recursive: true }, (eventType, filename) => {
            if (filename && filename.endsWith('.js')) {
                console.log(`🔄 Detected change: ${filename}`);
                this.generateAllIndexes().then(() => {
                    console.log('✅ Indexes updated after file change');
                });
            }
        });
    }
}

// CLI interface
const generator = new ExamIndexGenerator();
const command = process.argv[2];

switch (command) {
    case 'generate':
        generator.generateAllIndexes().then(() => {
            return generator.generateMasterIndex();
        }).then(() => {
            console.log('🎉 All indexes generated successfully!');
            process.exit(0);
        }).catch(error => {
            console.error('❌ Error generating indexes:', error);
            process.exit(1);
        });
        break;
        
    case 'watch':
        generator.generateAllIndexes().then(() => {
            return generator.generateMasterIndex();
        }).then(() => {
            console.log('✅ Initial indexes generated');
            generator.watchForChanges();
        }).catch(error => {
            console.error('❌ Error in watch mode:', error);
            process.exit(1);
        });
        break;
        
    default:
        console.log('Usage: node generate-exam-index.js [generate|watch]');
        console.log('  generate: Generate all index files once');
        console.log('  watch: Generate indexes and watch for changes');
        process.exit(1);
}

export default ExamIndexGenerator; 