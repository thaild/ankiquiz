/**
 * Netlify Identity Authentication Utility
 * Provides comprehensive authentication management for the AnkiQuiz application
 */

class AuthManager {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.listeners = new Map();
    this.init();
  }

  /**
   * Initialize Netlify Identity
   */
  init() {
    if (typeof netlifyIdentity === 'undefined') {
      console.error('Netlify Identity widget not loaded');
      return false;
    }

    try {
      netlifyIdentity.init();
      this.isInitialized = true;

      // Set up event listeners
      this.setupEventListeners();

      // Check for existing user
      this.currentUser = netlifyIdentity.currentUser();

      console.log('AuthManager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AuthManager:', error);
      return false;
    }
  }

  /**
   * Set up Netlify Identity event listeners
   */
  setupEventListeners() {
    netlifyIdentity.on('login', user => {
      console.log('User logged in:', user);
      this.currentUser = user;
      this.notifyListeners('login', user);
    });

    netlifyIdentity.on('logout', () => {
      console.log('User logged out');
      this.currentUser = null;
      this.notifyListeners('logout', null);
    });

    netlifyIdentity.on('error', error => {
      console.error('Netlify Identity error:', error);
      this.notifyListeners('error', error);
    });

    netlifyIdentity.on('close', () => {
      this.notifyListeners('close', null);
    });
  }

  /**
   * Add event listener for authentication events
   * @param {string} event - Event name (login, logout, error, close)
   * @param {function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in auth event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Open login modal
   */
  login() {
    if (!this.isInitialized) {
      console.error('AuthManager not initialized');
      return;
    }
    netlifyIdentity.open('login');
  }

  /**
   * Open signup modal
   */
  signup() {
    if (!this.isInitialized) {
      console.error('AuthManager not initialized');
      return;
    }
    netlifyIdentity.open('signup');
  }

  /**
   * Logout current user
   */
  logout() {
    if (!this.isInitialized) {
      console.error('AuthManager not initialized');
      return;
    }
    netlifyIdentity.logout();
  }

  /**
   * Close authentication modal
   */
  close() {
    if (!this.isInitialized) {
      console.error('AuthManager not initialized');
      return;
    }
    netlifyIdentity.close();
  }

  /**
   * Get current user
   * @returns {Object|null} Current user object or null
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get user's email
   * @returns {string|null} User's email or null
   */
  getUserEmail() {
    return this.currentUser?.email || null;
  }

  /**
   * Get user's full name
   * @returns {string|null} User's full name or null
   */
  getUserName() {
    return this.currentUser?.user_metadata?.full_name || this.currentUser?.email || 'User';
  }

  /**
   * Get user's ID
   * @returns {string|null} User's ID or null
   */
  getUserId() {
    return this.currentUser?.id || null;
  }

  /**
   * Get JWT token for API calls
   * @returns {Promise<string|null>} JWT token or null
   */
  async getToken() {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const token = await netlifyIdentity.currentUser().jwt();
      return token;
    } catch (error) {
      console.error('Failed to get JWT token:', error);
      return null;
    }
  }

  /**
   * Make authenticated API request
   * @param {string} url - API endpoint URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async authenticatedRequest(url, options = {}) {
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Protect a function to only run for authenticated users
   * @param {function} fn - Function to protect
   * @param {function} onUnauthorized - Callback for unauthorized access
   * @returns {function} Protected function
   */
  protect(fn, onUnauthorized = null) {
    return (...args) => {
      if (this.isAuthenticated()) {
        return fn(...args);
      } else {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          this.login();
        }
        return null;
      }
    };
  }

  /**
   * Show authentication status in UI
   * @param {HTMLElement} element - Element to update
   */
  updateUI(element) {
    if (!element) return;

    if (this.isAuthenticated()) {
      const userName = this.getUserName();
      element.innerHTML = `
        <i class="fas fa-user text-success"></i> 
        Welcome, <strong>${userName}</strong>
      `;
      element.className = 'text-success';

      // Show logout button, hide login button
      const loginBtn = document.getElementById('login');
      const logoutBtn = document.getElementById('logout');
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
      element.innerHTML = '<i class="fas fa-user-slash"></i> Not logged in';
      element.className = 'text-muted';

      // Show login button, hide logout button
      const loginBtn = document.getElementById('login');
      const logoutBtn = document.getElementById('logout');
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Create global instance
window.authManager = new AuthManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
