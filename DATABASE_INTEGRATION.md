# Database Integration for AnkiQuiz

This document describes the Netlify database integration added to the AnkiQuiz application for storing exam results and tracking user progress.

## Overview

The database integration provides:
- **Persistent storage** of exam results
- **User progress tracking** across sessions
- **Statistics and analytics** for performance monitoring
- **Results dashboard** for viewing historical data

## Architecture

### Backend (Node.js + Express)
- **Server**: `server/server.js` - Express server with API endpoints
- **Database**: `server/database.js` - PostgreSQL connection and operations
- **Configuration**: `server/config.env` - Environment variables

### Frontend (JavaScript)
- **Database Client**: `public/js/database-client.js` - API communication
- **Results Dashboard**: `public/js/results-dashboard.js` - UI for viewing results
- **Integration**: Modified `public/js/classes.js` and `public/js/exam.js`

## Database Schema

### exam_results Table
```sql
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
);
```

### exam_sessions Table
```sql
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
);
```

## API Endpoints

### Exam Results
- `POST /api/exam-results` - Save exam result
- `GET /api/exam-results/user/:userId` - Get user's exam results
- `GET /api/exam-results/exam/:examId` - Get results by exam ID

### Exam Sessions
- `POST /api/exam-sessions` - Save/update exam session
- `GET /api/exam-sessions/:sessionId` - Get exam session
- `PUT /api/exam-sessions/:sessionId/complete` - Complete exam session

### Statistics
- `GET /api/user-stats/:userId` - Get user statistics

### Health Check
- `GET /api/health` - Server health status

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
The database connection is configured in `server/config.env`:
```
NETLIFY_DATABASE_URL=
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev-server

# Production mode
npm run server
```

### 4. Start the Frontend
```bash
# Start the frontend server
npm start
```

## Features

### User ID Management
- **Automatic expiration**: User IDs expire after 1 week of inactivity
- **Local storage**: User ID is stored in localStorage with timestamp
- **Auto-reset**: New user ID is generated when expired

### Submit-Based Result Saving
- **Manual submission**: Results are only saved when user clicks "Submit Result to Database"
- **No duplicates**: Only one record per user + exam combination (upsert)
- **Data integrity**: Prevents duplicate records with UNIQUE constraint

### Review Logic
- **Database priority**: When reviewing, system checks database first
- **Local fallback**: Falls back to localStorage if no database record found
- **Seamless experience**: Users see their previous progress regardless of source

### Results Dashboard
Access the dashboard via the settings menu (gear icon) → "Results Dashboard"

Features:
- **Results List**: View all completed exams with scores
- **Pagination**: Navigate through large result sets
- **Statistics**: View performance analytics
- **Details**: View detailed exam results
- **Delete**: Remove unwanted results

### Statistics
The dashboard provides comprehensive statistics:
- Total exams taken
- Average score
- Pass rate (exams with ≥70% score)
- Highest and lowest scores
- Performance breakdown

## Database Client API

### Methods

#### saveExamResult(examData)
Saves a completed exam result to the database.

```javascript
const result = await window.databaseClient.saveExamResult({
  examId: 'SAP-C01',
  examName: 'AWS Solutions Architect Professional',
  score: 85,
  totalQuestions: 20,
  correctAnswers: 17,
  incorrectAnswers: 3,
  // ... other fields
});
```

#### getUserExamResults(limit)
Retrieves user's exam results.

```javascript
const results = await window.databaseClient.getUserExamResults(50);
```

#### getUserStats()
Retrieves user statistics.

```javascript
const stats = await window.databaseClient.getUserStats();
```

#### saveExamSession(sessionData)
Saves ongoing exam progress.

```javascript
await window.databaseClient.saveExamSession({
  sessionId: 'session_123',
  examId: 'SAP-C01',
  currentQuestion: 5,
  answersData: { 0: 'A', 1: 'B,C' },
  // ... other fields
});
```

## Error Handling

The system includes comprehensive error handling:
- **Network errors**: Graceful fallback with user notifications
- **Database errors**: Detailed logging and user feedback
- **Validation errors**: Input validation with helpful messages
- **Connection issues**: Automatic retry mechanisms

## Security Features

- **Rate limiting**: Prevents API abuse
- **CORS configuration**: Secure cross-origin requests
- **Input validation**: Sanitizes all user inputs
- **Error sanitization**: Hides sensitive information in production

## Performance Optimizations

- **Connection pooling**: Efficient database connections
- **Indexed queries**: Fast data retrieval
- **JSONB storage**: Efficient JSON data storage
- **Pagination**: Handles large datasets efficiently

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `server/config.env` configuration
   - Verify network connectivity
   - Ensure database server is running

2. **CORS Errors**
   - Verify CORS_ORIGIN in config
   - Check frontend URL matches configuration

3. **Results Not Saving**
   - Check browser console for errors
   - Verify server is running on port 3000
   - Check database client initialization

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in the config file.

## Future Enhancements

- **Real-time sync**: WebSocket integration for live updates
- **Export functionality**: Download results as CSV/PDF
- **Advanced analytics**: Performance trends and insights
- **Multi-user support**: User authentication and authorization
- **Backup/restore**: Data backup and recovery features

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review server logs for backend issues
3. Verify database connectivity
4. Test API endpoints directly

The database integration provides a robust foundation for tracking exam progress and analyzing performance over time. 