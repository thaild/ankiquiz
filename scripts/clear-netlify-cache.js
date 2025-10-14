#!/usr/bin/env node

/**
 * Netlify Cache Clear Script
 * Clears Netlify cache and triggers fresh deployment
 */

import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class NetlifyCacheClear {
  constructor() {
    this.netlifyConfig = this.loadNetlifyConfig();
  }

  /**
   * Load Netlify configuration
   */
  loadNetlifyConfig() {
    const configPath = path.join(__dirname, '../netlify.toml');
    if (fs.existsSync(configPath)) {
      console.log('📄 Found netlify.toml configuration');
      return true;
    }
    return false;
  }

  /**
   * Clear Netlify cache
   */
  clearCache() {
    try {
      console.log('🧹 Clearing Netlify cache...');

      // Method 1: Use Netlify CLI if available
      try {
        execSync('netlify cache:clear', {stdio: 'inherit'});
        console.log('✅ Cache cleared using Netlify CLI');
        return true;
      } catch (error) {
        console.log('⚠️ Netlify CLI not available, trying alternative methods...');
      }

      // Method 2: Trigger deployment with cache-busting
      this.triggerCacheBustDeployment();

      return true;
    } catch (error) {
      console.error('❌ Failed to clear cache:', error.message);
      return false;
    }
  }

  /**
   * Trigger deployment with cache-busting
   */
  triggerCacheBustDeployment() {
    try {
      // Create a cache-busting file
      const cacheBustFile = path.join(__dirname, '../public/.cache-bust');
      const timestamp = Date.now();

      fs.writeFileSync(
        cacheBustFile,
        `Cache busted at: ${new Date().toISOString()}\nTimestamp: ${timestamp}`
      );

      console.log('📝 Created cache-bust file:', cacheBustFile);
      console.log('🚀 Next deployment will clear cache automatically');

      // Clean up the file after a short delay
      setTimeout(() => {
        try {
          fs.unlinkSync(cacheBustFile);
          console.log('🗑️ Cleaned up cache-bust file');
        } catch (error) {
          console.warn('⚠️ Could not clean up cache-bust file:', error.message);
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Failed to create cache-bust file:', error.message);
    }
  }

  /**
   * Generate fresh index files
   */
  generateFreshIndexes() {
    try {
      console.log('🔄 Generating fresh index files...');
      execSync('npm run generate-indexes', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Fresh index files generated');
    } catch (error) {
      console.error('❌ Failed to generate index files:', error.message);
    }
  }

  /**
   * Run the cache clearing process
   */
  async run() {
    console.log('🚀 Starting Netlify cache clear process...');

    // Step 1: Generate fresh index files
    this.generateFreshIndexes();

    // Step 2: Clear cache
    const success = this.clearCache();

    if (success) {
      console.log('✅ Cache clear process completed successfully!');
      console.log('💡 Next deployment will use fresh data');
    } else {
      console.log('⚠️ Cache clear process completed with warnings');
    }
  }
}

// Run the cache clear process
const cacheClear = new NetlifyCacheClear();
cacheClear.run();
