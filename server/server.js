import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { db, initializeDatabase } from './database.js';
import { port, rateLimit as _rateLimit, api, nodeEnv } from './config.js';

const app = express();
const PORT = port;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: _rateLimit.windowMs,
  max: _rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: api.corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// API Routes

// Save exam result
app.post('/api/exam-results', async (req, res) => {
  try {
    const resultData = req.body;
    
    // Validate required fields
    if (!resultData.examId || !resultData.examName || resultData.score === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: examId, examName, score' 
      });
    }

    // Ensure numeric fields are integers
    const validatedData = {
      ...resultData,
      score: parseInt(resultData.score) || 0,
      totalQuestions: parseInt(resultData.totalQuestions) || 0,
      correctAnswers: parseInt(resultData.correctAnswers) || 0,
      incorrectAnswers: parseInt(resultData.incorrectAnswers) || 0,
      unansweredQuestions: parseInt(resultData.unansweredQuestions) || 0,
      timeTaken: parseInt(resultData.timeTaken) || 0
    };

    const savedResult = await db.saveExamResult(validatedData);
    res.status(201).json({
      success: true,
      message: 'Exam result saved successfully',
      resultId: savedResult.id
    });
  } catch (error) {
    console.error('Error saving exam result:', error);
    res.status(500).json({ 
      error: 'Failed to save exam result',
      details: error.message 
    });
  }
});

// Get exam results for a user
app.get('/api/exam-results/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const results = await db.getExamResults(userId, parseInt(limit));
    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Error getting exam results:', error);
    res.status(500).json({ 
      error: 'Failed to get exam results',
      details: error.message 
    });
  }
});

// Get exam results by exam ID
app.get('/api/exam-results/exam/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const { limit = 50 } = req.query;
    
    const results = await db.getExamResultsByExamId(examId, parseInt(limit));
    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Error getting exam results by exam ID:', error);
    res.status(500).json({ 
      error: 'Failed to get exam results',
      details: error.message 
    });
  }
});

// Get specific exam result for user
app.get('/api/exam-results/user/:userId/exam/:examId', async (req, res) => {
  try {
    const { userId, examId } = req.params;
    
    const result = await db.getExamResultForUser(userId, examId);
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error getting exam result for user:', error);
    res.status(500).json({ 
      error: 'Failed to get exam result for user',
      details: error.message 
    });
  }
});

// Delete all exam results for a user
app.delete('/api/exam-results/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    const result = await db.deleteUserExamResults(userId);
    res.json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting user exam results:', error);
    res.status(500).json({ 
      error: 'Failed to delete user exam results',
      details: error.message 
    });
  }
});

// Delete specific exam result for user
app.delete('/api/exam-results/user/:userId/exam/:examId', async (req, res) => {
  try {
    const { userId, examId } = req.params;
    
    // Validate parameters
    if (!userId || !examId) {
      return res.status(400).json({ 
        error: 'User ID and Exam ID are required' 
      });
    }

    const result = await db.deleteExamResultForUser(userId, examId);
    res.json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting exam result for user:', error);
    res.status(500).json({ 
      error: 'Failed to delete exam result for user',
      details: error.message 
    });
  }
});

// Save exam session
app.post('/api/exam-sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    
    // Validate required fields
    if (!sessionData.sessionId || !sessionData.examId || !sessionData.examName) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, examId, examName' 
      });
    }

    const savedSession = await db.saveExamSession(sessionData);
    res.status(201).json({
      success: true,
      message: 'Exam session saved successfully',
      sessionId: savedSession.id
    });
  } catch (error) {
    console.error('Error saving exam session:', error);
    res.status(500).json({ 
      error: 'Failed to save exam session',
      details: error.message 
    });
  }
});

// Get exam session
app.get('/api/exam-sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await db.getExamSession(sessionId);
    if (!session) {
      return res.status(404).json({ 
        error: 'Exam session not found' 
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error getting exam session:', error);
    res.status(500).json({ 
      error: 'Failed to get exam session',
      details: error.message 
    });
  }
});

// Complete exam session
app.put('/api/exam-sessions/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await db.completeExamSession(sessionId);
    res.json({
      success: true,
      message: 'Exam session completed successfully'
    });
  } catch (error) {
    console.error('Error completing exam session:', error);
    res.status(500).json({ 
      error: 'Failed to complete exam session',
      details: error.message 
    });
  }
});

// Get user statistics
app.get('/api/user-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = await db.getUserStats(userId);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ 
      error: 'Failed to get user statistics',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: nodeEnv === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

startServer(); 