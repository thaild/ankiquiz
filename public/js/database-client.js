// Database Client for Exam Results with Authentication Support
class DatabaseClient {
  constructor() {
    // Get API base URL from environment or use default
    this.baseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
    this.userId = null;
    this.isAuthenticated = false;
    this._apiCache = new Map(); // Initialize API cache
    this._databaseAvailable = true; // Track database availability
    this._lastDatabaseCheck = 0; // Last time we checked database

    // Initialize authentication state
    this.initializeAuth();
  }

  // Initialize authentication state
  initializeAuth() {
    // Check if AuthManager is available
    if (window.authManager) {
      this.isAuthenticated = window.authManager.isAuthenticated();
      this.userId = window.authManager.getUserId();

      // Listen for authentication changes
      window.authManager.addEventListener('login', async () => {
        this.isAuthenticated = true;
        this.userId = window.authManager.getUserId();
        console.log('DatabaseClient: User authenticated', this.userId);

        // Attempt to migrate fallback user data
        try {
          const migrated = await this.migrateFallbackUserData();
          if (migrated) {
            console.log('Successfully migrated fallback user data to authenticated user');
            if (window.authManager) {
              window.authManager.showNotification(
                'Your previous exam data has been migrated to your account!',
                'success'
              );
            }
          }
        } catch (error) {
          console.error('Failed to migrate user data:', error);
        }
      });

      window.authManager.addEventListener('logout', () => {
        this.isAuthenticated = false;
        this.userId = null;
        console.log('DatabaseClient: User logged out');
      });
    } else {
      // Fallback to local user ID if AuthManager not available
      this.userId = this.getFallbackUserId();
      this.isAuthenticated = false;
      console.log('DatabaseClient: Using fallback user ID', this.userId);
    }
  }

  // Get authenticated user ID or fallback
  getUserId() {
    if (this.isAuthenticated && this.userId) {
      return this.userId;
    }

    // Return fallback user ID for unauthenticated users
    return this.getFallbackUserId();
  }

  // Generate or get fallback user ID from localStorage with 1 week expiration
  getFallbackUserId() {
    let userId = localStorage.getItem('FALLBACK_USER_ID');
    let userIdTimestamp = localStorage.getItem('FALLBACK_USER_ID_TIMESTAMP');

    // Check if user ID exists and is not expired (1 week = 7 * 24 * 60 * 60 * 1000 ms)
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();

    if (!userId || !userIdTimestamp || currentTime - parseInt(userIdTimestamp) > oneWeekInMs) {
      // Generate new fallback user ID
      userId = 'fallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('FALLBACK_USER_ID', userId);
      localStorage.setItem('FALLBACK_USER_ID_TIMESTAMP', currentTime.toString());
      console.log('Generated new fallback user ID:', userId);
    }

    return userId;
  }

  // Generate session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Make API request with authentication support
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authentication headers if user is authenticated
    if (this.isAuthenticated && window.authManager) {
      try {
        const token = await window.authManager.getToken();
        if (token) {
          defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get authentication token:', error);
      }
    }

    // Add user ID header for server-side user identification
    const currentUserId = this.getUserId();
    if (currentUserId) {
      defaultOptions.headers['X-User-ID'] = currentUserId;
      defaultOptions.headers['X-Auth-Status'] = this.isAuthenticated ? 'authenticated' : 'fallback';
    }

    try {
      const response = await fetch(url, {...defaultOptions, ...options});

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Save exam result
  async saveExamResult(examData) {
    const resultData = {
      userId: this.getUserId(),
      examId: examData.examId,
      examName: examData.examName,
      groupId: examData.groupId,
      groupName: examData.groupName,
      score: parseInt(examData.score) || 0,
      totalQuestions: parseInt(examData.totalQuestions) || 0,
      correctAnswers: parseInt(examData.correctAnswers) || 0,
      incorrectAnswers: parseInt(examData.incorrectAnswers) || 0,
      unansweredQuestions: parseInt(examData.unansweredQuestions) || 0,
      timeTaken: parseInt(examData.timeTaken) || 0,
      answersData: examData.answersData || {},
      reviewMarks: examData.reviewMarks || {},
      comments: examData.comments || {},
      // Add authentication metadata
      authInfo: this.getUserAuthInfo()
    };

    try {
      // Check if database is available
      if (!this.isDatabaseAvailable()) {
        console.warn('Database not available, skipping save operation');
        return {success: false, message: 'Database unavailable'};
      }

      const response = await this.makeRequest('/exam-results', {
        method: 'POST',
        body: JSON.stringify(resultData)
      });

      console.log('Exam result saved successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to save exam result:', error);
      // Mark database as unavailable for future requests
      this.markDatabaseUnavailable();
      throw error;
    }
  }

  // Save exam session (for ongoing exams)
  async saveExamSession(examData) {
    const sessionData = {
      sessionId: examData.sessionId,
      userId: this.getUserId(),
      examId: examData.examId,
      examName: examData.examName,
      groupId: examData.groupId,
      groupName: examData.groupName,
      currentQuestion: examData.currentQuestion || 1,
      answersData: examData.answersData || {},
      reviewMarks: examData.reviewMarks || {},
      comments: examData.comments || {},
      // Add authentication metadata
      authInfo: this.getUserAuthInfo()
    };

    try {
      const response = await this.makeRequest('/exam-sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });

      console.log('Exam session saved successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to save exam session:', error);
      throw error;
    }
  }

  // Get exam session
  async getExamSession(sessionId) {
    try {
      const response = await this.makeRequest(`/exam-sessions/${sessionId}`);
      return response.session;
    } catch (error) {
      console.error('Failed to get exam session:', error);
      throw error;
    }
  }

  // Complete exam session
  async completeExamSession(sessionId) {
    try {
      const response = await this.makeRequest(`/exam-sessions/${sessionId}/complete`, {
        method: 'PUT'
      });

      console.log('Exam session completed successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to complete exam session:', error);
      throw error;
    }
  }

  // Get user's exam results
  async getUserExamResults(limit = 50) {
    try {
      const response = await this.makeRequest(
        `/exam-results/user/${this.getUserId()}?limit=${limit}`
      );
      return response.results;
    } catch (error) {
      console.error('Failed to get user exam results:', error);
      throw error;
    }
  }

  // Get exam results by exam ID
  async getExamResultsByExamId(examId, limit = 50) {
    try {
      const response = await this.makeRequest(`/exam-results/exam/${examId}?limit=${limit}`);
      return response.results;
    } catch (error) {
      console.error('Failed to get exam results by exam ID:', error);
      throw error;
    }
  }

  // Get specific exam result for current user
  async getExamResultForUser(examId) {
    try {
      // Check if database is available
      if (!this.isDatabaseAvailable()) {
        console.warn('Database not available, skipping database request');
        return null;
      }

      const response = await this.makeRequest(
        `/exam-results/user/${this.getUserId()}/exam/${examId}`
      );
      return response.result;
    } catch (error) {
      console.error('Failed to get exam result for user:', error);
      // Mark database as unavailable for future requests
      this.markDatabaseUnavailable();
      return null;
    }
  }

  // Get current user ID
  getCurrentUserId() {
    return this.getUserId();
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Get user authentication info
  getUserAuthInfo() {
    return {
      userId: this.getUserId(),
      isAuthenticated: this.isAuthenticated,
      authProvider: this.isAuthenticated ? 'netlify' : 'fallback',
      userEmail:
        this.isAuthenticated && window.authManager ? window.authManager.getUserEmail() : null,
      userName: this.isAuthenticated && window.authManager ? window.authManager.getUserName() : null
    };
  }

  // Require authentication for sensitive operations
  requireAuthentication(operation = 'this operation') {
    if (!this.isAuthenticated) {
      const message = `Authentication required for ${operation}. Please log in to continue.`;
      console.warn(message);

      // Show notification if AuthManager is available
      if (window.authManager) {
        window.authManager.showNotification(message, 'warning');
        // Optionally trigger login
        setTimeout(() => {
          window.authManager.login();
        }, 2000);
      }

      throw new Error(message);
    }
    return true;
  }

  // Migrate fallback user data to authenticated user
  async migrateFallbackUserData() {
    if (!this.isAuthenticated) {
      console.log('No authenticated user to migrate data to');
      return false;
    }

    const fallbackUserId = this.getFallbackUserId();
    const authenticatedUserId = this.getUserId();

    if (fallbackUserId === authenticatedUserId) {
      console.log('No migration needed - same user ID');
      return false;
    }

    try {
      console.log(
        `Migrating data from fallback user ${fallbackUserId} to authenticated user ${authenticatedUserId}`
      );

      // Get fallback user's exam results
      const fallbackResults = await this.makeRequest(`/exam-results/user/${fallbackUserId}`);

      if (fallbackResults.results && fallbackResults.results.length > 0) {
        // Migrate each result to the authenticated user
        for (const result of fallbackResults.results) {
          result.userId = authenticatedUserId;
          result.migratedFrom = fallbackUserId;
          result.migrationDate = new Date().toISOString();

          await this.makeRequest('/exam-results', {
            method: 'POST',
            body: JSON.stringify(result)
          });
        }

        console.log(`Successfully migrated ${fallbackResults.results.length} exam results`);

        // Clear fallback user data
        await this.makeRequest(`/exam-results/user/${fallbackUserId}`, {
          method: 'DELETE'
        });

        // Clear fallback user ID from localStorage
        localStorage.removeItem('FALLBACK_USER_ID');
        localStorage.removeItem('FALLBACK_USER_ID_TIMESTAMP');

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to migrate fallback user data:', error);
      return false;
    }
  }

  // Delete all exam results for current user
  async deleteUserExamResults(userId = null) {
    // Require authentication for this sensitive operation
    this.requireAuthentication('deleting exam results');

    const targetUserId = userId || this.getUserId();

    try {
      const response = await this.makeRequest(`/exam-results/user/${targetUserId}`, {
        method: 'DELETE'
      });

      console.log('User exam results deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to delete user exam results:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await this.makeRequest(`/user-stats/${this.getUserId()}`);
      return response.stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }

  // Check server health
  async checkHealth() {
    try {
      const response = await this.makeRequest('/health');
      return response;
    } catch (error) {
      console.error('Server health check failed:', error);
      return {status: 'ERROR', error: error.message};
    }
  }

  // Clear API cache
  clearCache() {
    try {
      if (this._apiCache && this._apiCache.clear) {
        this._apiCache.clear();
      }
      console.log('API cache cleared');
    } catch (error) {
      console.warn('Failed to clear API cache:', error);
    }
  }

  // Clear cache for specific exam
  clearExamCache(examId) {
    try {
      const cacheKey = `exam_result_${this.getUserId()}_${examId}`;
      if (this._apiCache && this._apiCache.delete) {
        this._apiCache.delete(cacheKey);
      }
      console.log(`Cache cleared for exam: ${examId}`);
    } catch (error) {
      console.warn('Failed to clear exam cache:', error);
    }
  }

  // Clear session storage for exam loading
  clearExamSessionStorage(examId) {
    sessionStorage.removeItem(`exam_loaded_${examId}`);
    console.log(`Session storage cleared for exam: ${examId}`);
  }

  // Clear all session storage
  clearAllSessionStorage() {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('exam_loaded_')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('All exam session storage cleared');
  }

  // Auto-save exam progress
  async autoSaveExamProgress(exam) {
    if (!exam || !exam.questions || exam.questions.length === 0) {
      console.warn('No exam data to save');
      return;
    }

    const sessionData = {
      sessionId: exam.sessionId || this.generateSessionId(),
      examId: exam.examId,
      examName: exam.examName,
      groupId: exam.groupId,
      groupName: exam.groupName,
      currentQuestion: exam.current,
      answersData: exam.getChoice(),
      reviewMarks: exam.getMarkToReview(),
      comments: exam.getComment()
    };

    try {
      await this.saveExamSession(sessionData);

      // Store session ID in exam object if not already set
      if (!exam.sessionId) {
        exam.sessionId = sessionData.sessionId;
      }

      console.log('Exam progress auto-saved');
    } catch (error) {
      console.error('Failed to auto-save exam progress:', error);
    }
  }

  // Load exam session
  async loadExamSession(sessionId, exam) {
    try {
      const session = await this.getExamSession(sessionId);

      if (session) {
        // Restore exam state from session
        exam.current = session.current_question;
        exam.sessionId = session.session_id;

        // Restore answers, review marks, and comments
        if (session.answers_data) {
          Object.keys(session.answers_data).forEach(questionIndex => {
            exam.saveChoice(parseInt(questionIndex), session.answers_data[questionIndex]);
          });
        }

        if (session.review_marks) {
          Object.keys(session.review_marks).forEach(questionIndex => {
            exam.saveMarkToReview(parseInt(questionIndex), session.review_marks[questionIndex]);
          });
        }

        if (session.comments) {
          Object.keys(session.comments).forEach(questionIndex => {
            exam.setComment(parseInt(questionIndex), session.comments[questionIndex]);
          });
        }

        console.log('Exam session loaded successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to load exam session:', error);
      return false;
    }
  }

  // Database availability management
  isDatabaseAvailable() {
    // If we marked it as unavailable, check if enough time has passed to retry
    if (!this._databaseAvailable) {
      const now = Date.now();
      const timeSinceLastCheck = now - this._lastDatabaseCheck;
      const retryInterval = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastCheck > retryInterval) {
        this._databaseAvailable = true; // Reset availability for retry
        console.log('Retrying database connection after timeout');
      }
    }

    return this._databaseAvailable;
  }

  markDatabaseUnavailable() {
    this._databaseAvailable = false;
    this._lastDatabaseCheck = Date.now();
    console.warn('Database marked as unavailable, will retry in 5 minutes');
  }

  // Force database availability check
  async checkDatabaseHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        this._databaseAvailable = true;
        console.log('Database health check passed');
        return true;
      } else {
        this.markDatabaseUnavailable();
        return false;
      }
    } catch (error) {
      this.markDatabaseUnavailable();
      console.warn('Database health check failed:', error);
      return false;
    }
  }
}

// Create global instance
window.databaseClient = new DatabaseClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DatabaseClient;
}
