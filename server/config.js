import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({path: path.join(__dirname, '.env')});

export const port = process.env.PORT || 3000;
export const nodeEnv = process.env.NODE_ENV || 'development';

export const database = {
  url: process.env.NETLIFY_DATABASE_URL
};

export const api = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

export const rateLimit = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000
};

export const security = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  sessionSecret: process.env.SESSION_SECRET || 'default-session-secret'
};

export const logging = {
  level: process.env.LOG_LEVEL || 'info'
};
