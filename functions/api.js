import express from "express";
import serverless from "serverless-http";
import cors from "cors";

const api = express();

// Middleware
api.use(cors());
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
api.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  });
});

// Catch-all route to see what's being received
router.get("*", (req, res) => {
  res.json({
    message: "Catch-all route hit",
    originalUrl: req.originalUrl,
    url: req.url,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
api.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
    debug: {
      originalUrl: req.originalUrl,
      url: req.url,
      path: req.path
    }
  });
});

api.use("/", router);

// Add logging middleware to see what's happening
api.use((req, res, next) => {
  console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
  console.log(`[DEBUG] Original URL: ${req.originalUrl}`);
  console.log(`[DEBUG] Path: ${req.path}`);
  next();
});

export const handler = serverless(api); 