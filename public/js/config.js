// Client-side configuration
(function () {
  'use strict';

  // Get environment variables from meta tags or use defaults
  function getConfig() {
    const config = {
      // API Configuration
      API_BASE_URL: getMetaContent('api-base-url') || 'http://localhost:3000/api',
      
      // App Configuration
      APP_NAME: getMetaContent('app-name') || 'AnkiQuiz',
      APP_VERSION: getMetaContent('app-version') || '1.0.0',

      // Authentication Configuration
      ENABLE_AUTH: getMetaContent('enable-auth') === 'true',
      REQUIRE_AUTH: getMetaContent('require-auth') === 'true',
      AUTH_PROVIDER: getMetaContent('auth-provider') || 'netlify',

      // Feature Flags
      ENABLE_ANALYTICS: getMetaContent('enable-analytics') === 'true',
      ENABLE_DEBUG: getMetaContent('enable-debug') === 'true',

      // Default values
      DEFAULT_EXAM_TIME: parseInt(getMetaContent('default-exam-time')) || 180,
      MAX_QUESTIONS_PER_EXAM: parseInt(getMetaContent('max-questions-per-exam')) || 100
    };

    return config;
  }

  function getMetaContent(name) {
    const meta = document.querySelector(`meta[name="${name}"]`);
    return meta ? meta.getAttribute('content') : null;
  }

  // Set global configuration
  window.APP_CONFIG = getConfig();

  // Set individual variables for backward compatibility
  window.API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

  console.log('App configuration loaded:', window.APP_CONFIG);
})();
