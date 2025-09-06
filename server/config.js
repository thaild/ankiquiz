
import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const nodeEnv = process.env.NODE_ENV || 'development';

export const database = {
  url: process.env.NETLIFY_DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  name: process.env.DB_NAME || 'ankiquiz',
  user: process.env.DB_USER || 'username',
  password: process.env.DB_PASSWORD || 'password',
};

export const api = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

export const rateLimit = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
};

export const security = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
};

export const logging = {
  level: process.env.LOG_LEVEL || 'info',
};