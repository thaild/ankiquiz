// Vercel API function - separate from Netlify
// Version: 2247sing CommonJS with real database for Vercel
const express = require("express");
const cors = require("cors");

const api = express();

// Middleware
api.use(cors());
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

// Add logging middleware to see what's happening
api.use((req, res, next) => {
  // Handle API routes - strip /api/ prefix
  if (req.url && req.url.startsWith('/api/')) {
    const newPath = req.url.replace('/api/', '/');
    req.url = newPath;
    req.path = newPath;
  }
  // Handle Vercel function routes
  if (req.url && req.url.startsWith('/functions/api/')) {
    const newPath = req.url.replace('/functions/api/', '/');
    req.url = newPath;
    req.path = newPath;
  }
  next();
});

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    platform: "vercel"
  });
});

// Hello world endpoint
router.get("/hello", (req, res) => {
  res.json({
    message: "Hello World from Vercel!",
    timestamp: new Date().toISOString(),
    platform: "vercel"
  });
});

// API info endpoint
router.get("/info", (req, res) => {
  res.json({
    name: "AnkiQuiz API",
    version: "1.0.0",
    description: "Advanced AWS Certification Exam Preparation Tool API",
    platform: "vercel",
    endpoints: [
      "/api/health",
      "/api/hello",
      "/api/info",
      "/api/fake-api-1",
      "/api/fake-api-2",
      "/api/fake-api-3",
      "/api/fake-api-4",
      "/api/fake-api-5",
      "/api/fake-api-6",
      "/api/fake-api-7",
      "/api/fake-api-8"
    ]
  });
});

// Fake API endpoints with 5-second timeout
for (let i = 1; i <= 8; i++) {
  router.get(`/fake-api-${i}`, async (req, res) => {
    try {
      const startTime = new Date();
      console.log(`[${startTime.toISOString()}] Fake API ${i} called - starting 5 second delay...`);
      
      // Sleep for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      console.log(`[${endTime.toISOString()}] Fake API ${i} delay completed - sending response (duration: ${duration}ms)`);
      
      res.json({
        message: `Fake API ${i} response after 5 second delay`,
        timestamp: new Date().toISOString(),
        delay: "5000ms",
        status: "success",
        apiNumber: i,
        platform: "vercel"
      });
    } catch (error) {
      const errorTime = new Date();
      console.error(`[${errorTime.toISOString()}] Error in fake API ${i}:`, error);
      res.status(500).json({ 
        error: `Fake API ${i} failed`, 
        details: error.message,
        timestamp: new Date().toISOString(),
        apiNumber: i,
        platform: "vercel"
      });
    }
  });
}

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
    message: "API is working on Vercel!",
    timestamp: new Date().toISOString(),
    platform: "vercel",
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
      platform: "vercel",
      note: "Static file serving is disabled for now"
    });
  } else {
    res.status(404).json({
      error: "Not found",
      message: `Route ${req.method} ${req.path} not found`,
      platform: "vercel",
      debug: {
        originalUrl: req.originalUrl,
        url: req.url,
        path: req.path
      }
    });
  }
});

api.use("/", router);

// Vercel export format - default export must be a function
module.exports = api;
