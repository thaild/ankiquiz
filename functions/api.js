import express from "express";
import serverless from "serverless-http";
import cors from "cors";

// Simple database wrapper for now - we'll implement the real DB later
const db = {
  async saveExamResult(resultData) {
    console.log('Mock saveExamResult:', resultData);
    return { id: Date.now().toString() };
  },
  async getExamResults(userId, limit = 50) {
    console.log('Mock getExamResults:', userId, limit);
    return [];
  },
  async getExamResultsByExamId(examId, limit = 50) {
    console.log('Mock getExamResultsByExamId:', examId, limit);
    return [];
  },
  async getExamResultForUser(userId, examId) {
    console.log('Mock getExamResultForUser:', userId, examId);
    return null;
  },
  async deleteUserExamResults(userId) {
    console.log('Mock deleteUserExamResults:', userId);
    return { message: 'Mock deleted', deletedCount: 0 };
  },
  async deleteExamResultForUser(userId, examId) {
    console.log('Mock deleteExamResultForUser:', userId, examId);
    return { message: 'Mock deleted', deletedCount: 0 };
  },
  async saveExamSession(sessionData) {
    console.log('Mock saveExamSession:', sessionData);
    return { id: sessionData.sessionId };
  },
  async getExamSession(sessionId) {
    console.log('Mock getExamSession:', sessionId);
    return null;
  },
  async completeExamSession(sessionId) {
    console.log('Mock completeExamSession:', sessionId);
  },
  async getUserStats(userId) {
    console.log('Mock getUserStats:', userId);
    return { totalExams: 0, averageScore: 0 };
  }
};

const api = express();

// Middleware
api.use(cors());
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

// Add logging middleware to see what's happening
api.use((req, res, next) => {
  console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
  console.log(`[DEBUG] Original URL: ${req.originalUrl}`);
  console.log(`[DEBUG] Path: ${req.path}`);
  
  // Fix the path by removing the function prefix
  if (req.url && req.url.startsWith('/.netlify/functions/api/')) {
    const newPath = req.url.replace('/.netlify/functions/api/', '/');
    console.log(`[DEBUG] Fixed path: ${newPath}`);
    req.url = newPath;
    req.path = newPath;
  }
  
  // Handle API routes - strip /api/ prefix
  if (req.url && req.url.startsWith('/api/')) {
    const newPath = req.url.replace('/api/', '/');
    console.log(`[DEBUG] API path fixed: ${newPath}`);
    req.url = newPath;
    req.path = newPath;
  }
  
  // Handle root path for SPA
  if (req.url === '/.netlify/functions/api' || req.url === '/.netlify/functions/api/') {
    req.url = '/';
    req.path = '/';
  }
  
  next();
});

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Debug endpoint to see request details
router.get("/debug", (req, res) => {
  res.json({
    message: "Debug endpoint",
    originalUrl: req.originalUrl,
    url: req.url,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Hello world endpoint
router.get("/hello", (req, res) => {
  res.json({
    message: "Hello World!",
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
router.get("/info", (req, res) => {
  res.json({
    name: "AnkiQuiz API",
    version: "1.0.0",
    description: "Advanced AWS Certification Exam Preparation Tool API",
    endpoints: [
      "/api/health",
      "/api/hello",
      "/api/info",
      "/api/exams",
      "/api/questions",
      "/api/exam-results",
      "/api/exam-results/user/:userId",
      "/api/exam-results/exam/:examId",
      "/api/exam-results/user/:userId/exam/:examId",
      "/api/exam-sessions",
      "/api/exam-sessions/:sessionId",
      "/api/exam-sessions/:sessionId/complete",
      "/api/user-stats/:userId"
    ]
  });
});

// Exams endpoint
router.get("/exams", (req, res) => {
  res.json({
    exams: [
      {
        id: "PMI-PMP",
        name: "PMI Project Management Professional",
        description: "PMP certification exam preparation",
        questionCount: 1401
      },
      {
        id: "AWS-SAA",
        name: "AWS Solutions Architect Associate",
        description: "AWS SAA certification exam preparation",
        questionCount: 0
      }
    ]
  });
});

// Questions endpoint
router.get("/questions", (req, res) => {
  const { exam, limit = 10, offset = 0 } = req.query;
  
  res.json({
    message: "Questions endpoint",
    exam: exam || "all",
    limit: parseInt(limit),
    offset: parseInt(offset),
    total: 1401
  });
});

// Exam results endpoint
router.get("/exam-results/user/:userId/exam/:examId", (req, res) => {
  const { userId, examId } = req.params;
  
  res.json({
    message: "Exam results endpoint",
    userId: userId,
    examId: examId,
    results: {
      score: 85,
      totalQuestions: 50,
      correctAnswers: 42,
      timeSpent: 3600,
      completedAt: new Date().toISOString()
    }
  });
});

// Generic exam results endpoint
router.get("/exam-results/*", (req, res) => {
  res.json({
    message: "Exam results endpoint (generic)",
    path: req.path,
    params: req.params
  });
});

// ===== EXAM RESULTS API ROUTES (REAL DB) =====

// Save exam result
router.post("/exam-results", async (req, res) => {
  try {
    const resultData = req.body;
    if (!resultData.examId || !resultData.examName || resultData.score === undefined) {
      return res.status(400).json({ error: 'Missing required fields: examId, examName, score' });
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
    res.status(500).json({ error: 'Failed to save exam result', details: error.message });
  }
});

// Get exam results for a user
router.get("/exam-results/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    const results = await db.getExamResults(userId, parseInt(limit));
    res.json({ success: true, results, count: results.length });
  } catch (error) {
    console.error('Error getting exam results:', error);
    res.status(500).json({ error: 'Failed to get exam results', details: error.message });
  }
});

// Get exam results by exam ID
router.get("/exam-results/exam/:examId", async (req, res) => {
  try {
    const { examId } = req.params;
    const { limit = 50 } = req.query;
    const results = await db.getExamResultsByExamId(examId, parseInt(limit));
    res.json({ success: true, results, count: results.length });
  } catch (error) {
    console.error('Error getting exam results by exam ID:', error);
    res.status(500).json({ error: 'Failed to get exam results', details: error.message });
  }
});

// Get specific exam result for user
router.get("/exam-results/user/:userId/exam/:examId", async (req, res) => {
  try {
    const { userId, examId } = req.params;
    const result = await db.getExamResultForUser(userId, examId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error getting exam result for user:', error);
    res.status(500).json({ error: 'Failed to get exam result for user', details: error.message });
  }
});

// Delete all exam results for a user
router.delete("/exam-results/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const result = await db.deleteUserExamResults(userId);
    res.json({ success: true, message: result.message, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting user exam results:', error);
    res.status(500).json({ error: 'Failed to delete user exam results', details: error.message });
  }
});

// Delete specific exam result for user
router.delete("/exam-results/user/:userId/exam/:examId", async (req, res) => {
  try {
    const { userId, examId } = req.params;
    if (!userId || !examId) {
      return res.status(400).json({ error: 'User ID and Exam ID are required' });
    }
    const result = await db.deleteExamResultForUser(userId, examId);
    res.json({ success: true, message: result.message, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting exam result for user:', error);
    res.status(500).json({ error: 'Failed to delete exam result for user', details: error.message });
  }
});

// ===== EXAM SESSIONS API ROUTES (REAL DB) =====

// Save exam session
router.post("/exam-sessions", async (req, res) => {
  try {
    const sessionData = req.body;
    if (!sessionData.sessionId || !sessionData.examId || !sessionData.examName) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, examId, examName' });
    }
    const savedSession = await db.saveExamSession(sessionData);
    res.status(201).json({ success: true, message: 'Exam session saved successfully', sessionId: savedSession.id });
  } catch (error) {
    console.error('Error saving exam session:', error);
    res.status(500).json({ error: 'Failed to save exam session', details: error.message });
  }
});

// Get exam session
router.get("/exam-sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await db.getExamSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Exam session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error getting exam session:', error);
    res.status(500).json({ error: 'Failed to get exam session', details: error.message });
  }
});

// Complete exam session
router.put("/exam-sessions/:sessionId/complete", async (req, res) => {
  try {
    const { sessionId } = req.params;
    await db.completeExamSession(sessionId);
    res.json({ success: true, message: 'Exam session completed successfully' });
  } catch (error) {
    console.error('Error completing exam session:', error);
    res.status(500).json({ error: 'Failed to complete exam session', details: error.message });
  }
});

// ===== USER STATISTICS API ROUTES (REAL DB) =====

// Get user statistics
router.get("/user-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await db.getUserStats(userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Failed to get user statistics', details: error.message });
  }
});

// Error handling middleware
api.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  });
});



// Serve index.html for root and SPA routes
router.get("/", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    note: "Static file serving is disabled for now"
  });
});

// Catch-all route for SPA - serve index.html for non-API routes
router.get("*", (req, res) => {
  // If it's not an API route, return a message
  if (!req.path.startsWith("/api/")) {
    res.json({
      message: "SPA route requested",
      path: req.path,
      note: "Static file serving is disabled for now"
    });
  } else {
    res.status(404).json({
      error: "Not found",
      message: `Route ${req.method} ${req.path} not found`,
      debug: {
        originalUrl: req.originalUrl,
        url: req.url,
        path: req.path
      }
    });
  }
});

// 404 handler for API routes only
api.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `API Route ${req.method} ${req.path} not found`,
    debug: {
      originalUrl: req.originalUrl,
      url: req.url,
      path: req.path
    }
  });
});

api.use("/", router);

export const handler = serverless(api); 