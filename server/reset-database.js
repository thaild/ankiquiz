const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

// Database connection pool
const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetDatabase() {
  try {
    const client = await pool.connect();
    
    console.log('Dropping existing tables...');
    
    // Drop tables if they exist
    await client.query('DROP TABLE IF EXISTS exam_results CASCADE');
    await client.query('DROP TABLE IF EXISTS exam_sessions CASCADE');
    
    console.log('Tables dropped successfully');
    
    // Recreate tables
    console.log('Creating exam_results table...');
    await client.query(`
      CREATE TABLE exam_results (
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

    console.log('Creating exam_sessions table...');
    await client.query(`
      CREATE TABLE exam_sessions (
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

    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);
      CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
      CREATE INDEX idx_exam_results_completed_at ON exam_results(completed_at);
      CREATE INDEX idx_exam_results_user_exam ON exam_results(user_id, exam_id);
      CREATE INDEX idx_exam_sessions_session_id ON exam_sessions(session_id);
      CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
    `);

    client.release();
    console.log('Database reset completed successfully');
    
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the reset
resetDatabase().then(() => {
  console.log('Database reset completed');
  process.exit(0);
}).catch((error) => {
  console.error('Database reset failed:', error);
  process.exit(1);
}); 