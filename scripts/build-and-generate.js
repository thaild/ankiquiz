#!/usr/bin/env node

/**
 * Build and Generate Script
 * Automatically generates index.json files and triggers Netlify deployment
 */

import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BuildAndGenerate {
  constructor() {
    this.baseDir = path.join(__dirname, '../public/data');
    this.timestamp = new Date().toISOString();
  }

  /**
   * Generate index.json for all exam folders
   */
  generateIndexFiles() {
    console.log('🔄 Generating index.json files...');

    const examFolders = this.findExamFolders();

    examFolders.forEach(folder => {
      this.generateIndexForFolder(folder);
    });

    console.log(`✅ Generated ${examFolders.length} index.json files`);
  }

  /**
   * Find all exam folders that need index.json
   */
  findExamFolders() {
    const folders = [];

    const sources = ['examtopics', 'pma', 'whizlabs', 'freecams'];

    sources.forEach(source => {
      const sourcePath = path.join(this.baseDir, source);
      if (fs.existsSync(sourcePath)) {
        const items = fs.readdirSync(sourcePath, {withFileTypes: true});

        items.forEach(item => {
          if (item.isDirectory()) {
            const folderPath = path.join(sourcePath, item.name);
            const jsFiles = this.findJsFiles(folderPath);

            if (jsFiles.length > 0) {
              folders.push({
                path: folderPath,
                source: source,
                exam: item.name,
                files: jsFiles
              });
            }
          }
        });
      }
    });

    return folders;
  }

  /**
   * Find all .js files in a folder
   */
  findJsFiles(folderPath) {
    try {
      const files = fs.readdirSync(folderPath);
      return files.filter(file => file.endsWith('.js'));
    } catch (error) {
      console.warn(`⚠️ Could not read folder ${folderPath}:`, error.message);
      return [];
    }
  }

  /**
   * Generate index.json for a specific folder
   */
  generateIndexForFolder(folder) {
    const indexPath = path.join(folder.path, 'index.json');

    const indexData = {
      exam: folder.exam,
      source: folder.source,
      files: folder.files.sort(),
      generated: this.timestamp,
      totalFiles: folder.files.length
    };

    try {
      fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
      console.log(`📄 Generated ${indexPath}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${indexPath}:`, error.message);
    }
  }

  /**
   * Run the build process
   */
  async run() {
    try {
      console.log('🚀 Starting build and generate process...');

      // Step 1: Generate index.json files
      this.generateIndexFiles();

      // Step 2: Run npm build if package.json exists
      const packageJsonPath = path.join(__dirname, '../package.json');
      if (fs.existsSync(packageJsonPath)) {
        console.log('📦 Running npm build...');
        execSync('npm run build', {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
      }

      console.log('✅ Build and generate process completed!');
    } catch (error) {
      console.error('❌ Build process failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the build process
const builder = new BuildAndGenerate();
builder.run();
