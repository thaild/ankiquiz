// Database Client for Exam Results
class DatabaseClient {
  constructor() {
    // Get API base URL from environment or use default
    this.baseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
    this.userId = this.getUserId();
    this._apiCache = new Map(); // Initialize API cache
  }

  // Generate or get user ID from localStorage with 1 week expiration
  getUserId() {
    let userId = localStorage.getItem('USER_ID');
    let userIdTimestamp = localStorage.getItem('USER_ID_TIMESTAMP');
    
    // Check if user ID exists and is not expired (1 week = 7 * 24 * 60 * 60 * 1000 ms)
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();
    
    if (!userId || !userIdTimestamp || (currentTime - parseInt(userIdTimestamp)) > oneWeekInMs) {
      // Generate new user ID
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('USER_ID', userId);
      localStorage.setItem('USER_ID_TIMESTAMP', currentTime.toString());
      console.log('Generated new user ID:', userId);
    }
    
    return userId;
  }

  // Generate session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Make API request
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
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
      userId: this.userId,
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
      comments: examData.comments || {}
    };

    try {
      const response = await this.makeRequest('/exam-results', {
        method: 'POST',
        body: JSON.stringify(resultData)
      });

      console.log('Exam result saved successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to save exam result:', error);
      throw error;
    }
  }

  // Save exam session (for ongoing exams)
  async saveExamSession(examData) {
    const sessionData = {
      sessionId: examData.sessionId,
      userId: this.userId,
      examId: examData.examId,
      examName: examData.examName,
      groupId: examData.groupId,
      groupName: examData.groupName,
      currentQuestion: examData.currentQuestion || 1,
      answersData: examData.answersData || {},
      reviewMarks: examData.reviewMarks || {},
      comments: examData.comments || {}
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
      const response = await this.makeRequest(`/exam-results/user/${this.userId}?limit=${limit}`);
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
      const response = await this.makeRequest(`/exam-results/user/${this.userId}/exam/${examId}`);
      return response.result;
    } catch (error) {
      console.error('Failed to get exam result for user:', error);
      return null;
    }
  }

  // Get current user ID
  getCurrentUserId() {
    return this.userId;
  }

  // Delete all exam results for current user
  async deleteUserExamResults(userId = null) {
    const targetUserId = userId || this.userId;
    
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
      const response = await this.makeRequest(`/user-stats/${this.userId}`);
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
      return { status: 'ERROR', error: error.message };
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
      const cacheKey = `exam_result_${this.userId}_${examId}`;
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
}

// Create global instance
window.databaseClient = new DatabaseClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DatabaseClient;
} 