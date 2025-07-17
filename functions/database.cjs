const { Pool } = require('pg');
const path = require('path');

// Load environment variables - Netlify provides them directly
require('dotenv').config();

// Debug: Log environment variables (without sensitive data)
console.log('[DEBUG] Environment check:');
console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV);
console.log('[DEBUG] NETLIFY_DATABASE_URL exists:', !!process.env.NETLIFY_DATABASE_URL);

// Database connection pool
const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    // Create exam_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        exam_id VARCHAR(255) NOT NULL,
        exam_name VARCHAR(255) NOT NULL,
        group_id VARCHAR(255),
        group_name VARCHAR(255),
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        incorrect_answers INTEGER NOT NULL,
        unanswered_questions INTEGER DEFAULT 0,
        time_taken INTEGER DEFAULT 0,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        answers_data JSONB,
        review_marks JSONB,
        comments JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, exam_id)
      )
    `);

    // Create exam_sessions table for tracking ongoing exams
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255),
        exam_id VARCHAR(255) NOT NULL,
        exam_name VARCHAR(255) NOT NULL,
        group_id VARCHAR(255),
        group_name VARCHAR(255),
        current_question INTEGER DEFAULT 1,
        answers_data JSONB DEFAULT '{}',
        review_marks JSONB DEFAULT '{}',
        comments JSONB DEFAULT '{}',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_completed BOOLEAN DEFAULT FALSE
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
      CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
      CREATE INDEX IF NOT EXISTS idx_exam_results_completed_at ON exam_results(completed_at);
      CREATE INDEX IF NOT EXISTS idx_exam_results_user_exam ON exam_results(user_id, exam_id);
      CREATE INDEX IF NOT EXISTS idx_exam_sessions_session_id ON exam_sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id);
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Database operations
const db = {
  // Save exam result (upsert - update if exists, insert if not)
  async saveExamResult(resultData) {
    const {
      userId,
      examId,
      examName,
      groupId,
      groupName,
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions = 0,
      timeTaken = 0,
      answersData,
      reviewMarks,
      comments
    } = resultData;

    const query = `
      INSERT INTO exam_results (
        user_id, exam_id, exam_name, group_id, group_name,
        score, total_questions, correct_answers, incorrect_answers,
        unanswered_questions, time_taken, answers_data, review_marks, comments,
        completed_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, exam_id) 
      DO UPDATE SET 
        exam_name = EXCLUDED.exam_name,
        group_id = EXCLUDED.group_id,
        group_name = EXCLUDED.group_name,
        score = EXCLUDED.score,
        total_questions = EXCLUDED.total_questions,
        correct_answers = EXCLUDED.correct_answers,
        incorrect_answers = EXCLUDED.incorrect_answers,
        unanswered_questions = EXCLUDED.unanswered_questions,
        time_taken = EXCLUDED.time_taken,
        answers_data = EXCLUDED.answers_data,
        review_marks = EXCLUDED.review_marks,
        comments = EXCLUDED.comments,
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const values = [
      userId, examId, examName, groupId, groupName,
      score, totalQuestions, correctAnswers, incorrectAnswers,
      unansweredQuestions, timeTaken, 
      JSON.stringify(answersData), 
      JSON.stringify(reviewMarks), 
      JSON.stringify(comments)
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving exam result:', error);
      throw error;
    }
  },

  // Get exam results for a user
  async getExamResults(userId, limit = 50) {
    const query = `
      SELECT * FROM exam_results 
      WHERE user_id = $1 
      ORDER BY completed_at DESC 
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting exam results:', error);
      throw error;
    }
  },

  // Get exam results by exam ID
  async getExamResultsByExamId(examId, limit = 50) {
    const query = `
      SELECT * FROM exam_results 
      WHERE exam_id = $1 
      ORDER BY completed_at DESC 
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [examId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting exam results by exam ID:', error);
      throw error;
    }
  },

  // Get specific exam result for user
  async getExamResultForUser(userId, examId) {
    const query = `
      SELECT * FROM exam_results 
      WHERE user_id = $1 AND exam_id = $2
      ORDER BY completed_at DESC 
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [userId, examId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting exam result for user:', error);
      throw error;
    }
  },

  // Save or update exam session
  async saveExamSession(sessionData) {
    const {
      sessionId,
      userId,
      examId,
      examName,
      groupId,
      groupName,
      currentQuestion,
      answersData,
      reviewMarks,
      comments
    } = sessionData;

    const query = `
      INSERT INTO exam_sessions (
        session_id, user_id, exam_id, exam_name, group_id, group_name,
        current_question, answers_data, review_marks, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (session_id) 
      DO UPDATE SET 
        current_question = EXCLUDED.current_question,
        answers_data = EXCLUDED.answers_data,
        review_marks = EXCLUDED.review_marks,
        comments = EXCLUDED.comments,
        last_activity = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const values = [
      sessionId, userId, examId, examName, groupId, groupName,
      currentQuestion, answersData, reviewMarks, comments
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving exam session:', error);
      throw error;
    }
  },

  // Get exam session
  async getExamSession(sessionId) {
    const query = `
      SELECT * FROM exam_sessions 
      WHERE session_id = $1
    `;

    try {
      const result = await pool.query(query, [sessionId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting exam session:', error);
      throw error;
    }
  },

  // Complete exam session
  async completeExamSession(sessionId) {
    const query = `
      UPDATE exam_sessions 
      SET is_completed = TRUE, last_activity = CURRENT_TIMESTAMP
      WHERE session_id = $1
    `;

    try {
      await pool.query(query, [sessionId]);
    } catch (error) {
      console.error('Error completing exam session:', error);
      throw error;
    }
  },

  // Get user statistics
  async getUserStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_exams,
        AVG(score) as average_score,
        MAX(score) as highest_score,
        MIN(score) as lowest_score,
        COUNT(CASE WHEN score >= 70 THEN 1 END) as passed_exams,
        COUNT(CASE WHEN score < 70 THEN 1 END) as failed_exams
      FROM exam_results 
      WHERE user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  },

  // Delete all exam results for a user
  async deleteUserExamResults(userId) {
    const query = `
      DELETE FROM exam_results 
      WHERE user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return {
        deletedCount: result.rowCount,
        message: `Deleted ${result.rowCount} exam results for user ${userId}`
      };
    } catch (error) {
      console.error('Error deleting user exam results:', error);
      throw error;
    }
  },

  // Delete specific exam result for user
  async deleteExamResultForUser(userId, examId) {
    const query = `
      DELETE FROM exam_results 
      WHERE user_id = $1 AND exam_id = $2
    `;

    try {
      const result = await pool.query(query, [userId, examId]);
      return {
        deletedCount: result.rowCount,
        message: `Deleted ${result.rowCount} exam result for user ${userId} and exam ${examId}`
      };
    } catch (error) {
      console.error('Error deleting exam result for user:', error);
      throw error;
    }
  },

  // Close database connection
  async close() {
    await pool.end();
  }
};

module.exports = { db, initializeDatabase }; 