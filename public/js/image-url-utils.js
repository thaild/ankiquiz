/**
 * Image URL Utility Functions
 * Provides utilities for cleaning and processing image URLs
 */

class ImageUrlUtils {
  /**
   * Clean image URL by removing query parameters
   * @param {string} url - The image URL with query parameters
   * @returns {string} - Clean URL without query parameters
   */
  static cleanImageUrl(url) {
    if (!url || typeof url !== 'string') {
      return url;
    }

    try {
      // Parse the URL
      const urlObj = new URL(url);
      
      // Return only the origin + pathname (removes query and hash)
      return `${urlObj.origin}${urlObj.pathname}`;
    } catch (error) {
      // If URL parsing fails, try simple string manipulation
      console.warn('Failed to parse URL:', url, error);
      
      // Remove everything after '?' (query parameters)
      const questionMarkIndex = url.indexOf('?');
      if (questionMarkIndex !== -1) {
        return url.substring(0, questionMarkIndex);
      }
      
      // Remove everything after '#' (hash/fragment)
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        return url.substring(0, hashIndex);
      }
      
      return url;
    }
  }

  /**
   * Clean image URL from HTML content
   * @param {string} htmlContent - HTML content containing image tags
   * @returns {string} - HTML content with cleaned image URLs
   */
  static cleanImageUrlsInHtml(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
      return htmlContent;
    }

    // Regular expression to match img src attributes
    const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    
    return htmlContent.replace(imgSrcRegex, (match, srcUrl) => {
      const cleanUrl = this.cleanImageUrl(srcUrl);
      return match.replace(srcUrl, cleanUrl);
    });
  }

  /**
   * Clean image URLs in exam data object
   * @param {Object} examData - Exam data object
   * @returns {Object} - Exam data with cleaned image URLs
   */
  static cleanExamDataImages(examData) {
    if (!examData || typeof examData !== 'object') {
      return examData;
    }

    const cleanedData = { ...examData };

    // Clean direct image field
    if (cleanedData.image) {
      cleanedData.image = this.cleanImageUrl(cleanedData.image);
    }

    // Clean image URLs in data.question_text
    if (cleanedData.data && cleanedData.data.question_text) {
      cleanedData.data.question_text = this.cleanImageUrlsInHtml(cleanedData.data.question_text);
    }

    // Clean image URLs in data.question
    if (cleanedData.data && cleanedData.data.question) {
      cleanedData.data.question = this.cleanImageUrlsInHtml(cleanedData.data.question);
    }

    // Clean image URLs in options if they contain HTML
    if (cleanedData.data && cleanedData.data.options) {
      cleanedData.data.options = cleanedData.data.options.map(option => {
        if (typeof option === 'string' && option.includes('<img')) {
          return this.cleanImageUrlsInHtml(option);
        }
        return option;
      });
    }

    return cleanedData;
  }

  /**
   * Clean image URLs in an array of exam data
   * @param {Array} examDataArray - Array of exam data objects
   * @returns {Array} - Array of exam data with cleaned image URLs
   */
  static cleanExamDataArray(examDataArray) {
    if (!Array.isArray(examDataArray)) {
      return examDataArray;
    }

    return examDataArray.map(examData => this.cleanExamDataImages(examData));
  }

  /**
   * Batch clean image URLs in multiple exam files
   * @param {Object} examFiles - Object containing exam data arrays
   * @returns {Object} - Object with cleaned exam data arrays
   */
  static cleanExamFiles(examFiles) {
    if (!examFiles || typeof examFiles !== 'object') {
      return examFiles;
    }

    const cleanedFiles = {};
    
    for (const [fileName, examData] of Object.entries(examFiles)) {
      if (Array.isArray(examData)) {
        cleanedFiles[fileName] = this.cleanExamDataArray(examData);
      } else if (examData && typeof examData === 'object') {
        cleanedFiles[fileName] = this.cleanExamDataImages(examData);
      } else {
        cleanedFiles[fileName] = examData;
      }
    }

    return cleanedFiles;
  }

  /**
   * Validate if URL is a clean image URL
   * @param {string} url - URL to validate
   * @returns {boolean} - True if URL is clean (no query parameters)
   */
  static isCleanImageUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }

    return !url.includes('?') && !url.includes('#');
  }

  /**
   * Get statistics about image URLs in exam data
   * @param {Array} examDataArray - Array of exam data objects
   * @returns {Object} - Statistics about image URLs
   */
  static getImageUrlStats(examDataArray) {
    if (!Array.isArray(examDataArray)) {
      return { total: 0, withImages: 0, cleanUrls: 0, dirtyUrls: 0 };
    }

    let total = 0;
    let withImages = 0;
    let cleanUrls = 0;
    let dirtyUrls = 0;

    examDataArray.forEach(examData => {
      total++;
      
      if (examData.image) {
        withImages++;
        
        if (this.isCleanImageUrl(examData.image)) {
          cleanUrls++;
        } else {
          dirtyUrls++;
        }
      }

      // Check for images in question text
      if (examData.data && examData.data.question_text && examData.data.question_text.includes('<img')) {
        const imgMatches = examData.data.question_text.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
        if (imgMatches) {
          imgMatches.forEach(match => {
            const srcMatch = match.match(/src=["']([^"']+)["']/);
            if (srcMatch) {
              if (this.isCleanImageUrl(srcMatch[1])) {
                cleanUrls++;
              } else {
                dirtyUrls++;
              }
            }
          });
        }
      }
    });

    return {
      total,
      withImages,
      cleanUrls,
      dirtyUrls,
      dirtyPercentage: dirtyUrls > 0 ? ((dirtyUrls / (cleanUrls + dirtyUrls)) * 100).toFixed(2) : 0
    };
  }
}

// Make it globally available
window.ImageUrlUtils = ImageUrlUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageUrlUtils;
}
