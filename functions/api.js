import express from "express";
import serverless from "serverless-http";
import cors from "cors";

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
      "/api/questions"
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