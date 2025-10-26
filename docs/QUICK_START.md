# 🚀 Quick Start Guide - AnkiQuiz

## About AnkiQuiz

AnkiQuiz is an advanced certification exam preparation tool that helps you prepare for AWS, PMI, and other professional certifications. It features:

- 📚 **Comprehensive Exam Library**: PMI-PMP, AWS Solutions Architect, DevOps, and more
- 🎯 **Interactive Practice**: Take timed exams with immediate feedback
- 📊 **Progress Tracking**: Save results and track your progress
- 🔐 **Authentication**: Optional Netlify Identity authentication
- 💾 **Auto-loading**: Automatic exam data loading from folders

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (for results tracking)
- Git repository
- Netlify account (for deployment)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/thaild/ankiquiz.git
cd ankiquiz

# Install dependencies
npm install
```

## Step 2: Configure Environment

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your settings
nano .env
```

### Environment Variables:

```env
# Development
NODE_ENV=development
PORT=3000

# Database (use your PostgreSQL connection string)
NETLIFY_DATABASE_URL=postgresql://user:password@host:5432/database

# API Configuration
API_BASE_URL=http://localhost:3000/api
CORS_ORIGIN=*

# Netlify Configuration
NETLIFY_SITE_ID=your-site-id
NETLIFY_AUTH_TOKEN=your-auth-token
```

## Step 3: Set Up Database

The application uses PostgreSQL to store exam results. You'll need to:

1. **Create a PostgreSQL database** (can use Netlify Postgres, AWS RDS, Supabase, etc.)

2. **Initialize the database tables:**
   ```bash
   npm run reset-db
   ```

3. **Generate exam indexes:**
   ```bash
   npm run generate-indexes
   ```

## Step 4: Run Locally

```bash
# Start development server
npm start

# Or with auto-reload
npm run dev-server

# Start API server separately (if needed)
npm run server
```

Visit `http://localhost:3000` to see the application.

## Step 5: Deploy to Netlify

### 5.1 Connect Repository

1. Go to [Netlify](https://netlify.com)
2. Click **"New site from Git"**
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select the `ankiquiz` repository

### 5.2 Configure Build Settings

In Netlify build settings:
- **Build command:** `npm run build`
- **Publish directory:** `.`
- **Node version:** `18`

### 5.3 Set Environment Variables

Go to **Site settings → Environment variables** and add:

```env
NETLIFY_DATABASE_URL=your-postgres-connection-string
NODE_ENV=production
API_BASE_URL=https://your-site.netlify.app/api
ENABLE_ANALYTICS=false
ENABLE_DEBUG=false
```

### 5.4 Configure Netlify Identity (Optional)

1. Go to **Site settings → Identity**
2. Click **Enable Identity**
3. Configure registration preferences
4. Optionally enable external providers (Google, GitHub, etc.)

### 5.5 Deploy!

Click **Deploy site** and wait for the build to complete.

## Step 6: Configure Netlify Functions

The API runs on Netlify Functions (serverless). Configure the database in your Netlify dashboard.

1. Go to **Site settings → Functions**
2. Ensure `functions/` directory is set as functions directory
3. Check that `database.cjs` is properly deployed

## Step 7: Test Your Deployment

1. Visit your deployed site
2. Try creating an account (if Identity is enabled)
3. Take a sample exam
4. Check that results are saved
5. View the Results Dashboard

## Project Structure

```
ankiquiz/
├── docs/                    # Documentation
├── functions/               # Netlify serverless functions
│   ├── api.cjs             # API endpoints
│   └── database.cjs        # Database operations
├── public/                  # Static assets
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript modules
│   │   ├── auth.js        # Authentication
│   │   ├── exam-loader.js # Auto-loading system
│   │   └── database-client.js # Database client
│   └── data/              # Exam data
├── server/                 # Optional Express server
├── scripts/               # Build and utility scripts
├── tools/                 # Development tools
├── index.html             # Main HTML file
├── netlify.toml           # Netlify configuration
└── package.json           # Dependencies
```

## Available Scripts

```bash
# Development
npm start              # Start development server
npm run dev-server     # Start with auto-reload
npm run server         # Start Express API server

# Database
npm run reset-db       # Reset database tables
npm run generate-indexes  # Generate exam indexes

# Build
npm run build         # Build for production
npm run clear-cache   # Clear Netlify cache

# Code Quality
npm run lint          # Run ESLint
npm run format        # Format with Prettier
```

## Features

### ✅ Exam Management
- Auto-loading exam data from folders
- Support for multiple exam sources (Whizlabs, ExamTopics, PMA)
- Real-time answer validation
- Review and star questions

### ✅ Progress Tracking
- Save exam results to database
- View detailed statistics
- Track performance over time
- Results dashboard

### ✅ Authentication
- Optional Netlify Identity authentication
- Fallback user IDs for unauthenticated users
- Automatic data migration on login

### ✅ Auto-Submit
- Auto-save answers every 30 seconds
- Protect against data loss
- Auto-feedback feature

## Troubleshooting

### Build Fails
- Check Node.js version (must be 18+)
- Verify all dependencies are installed
- Check `netlify.toml` configuration

### Database Errors
- Verify `NETLIFY_DATABASE_URL` is set correctly
- Check database connection in Netlify Functions logs
- Run `npm run reset-db` to recreate tables

### API Not Working
- Check Netlify Functions logs
- Verify `functions/` directory is correct
- Check CORS configuration

### Identity Not Working
- Enable Identity in Netlify dashboard
- Check `index.html` for Identity script
- Verify CSP headers allow Identity

## Getting Help

- 📖 Read the [full documentation](./)
- 🐛 [Report issues](https://github.com/thaild/ankiquiz/issues)
- 💬 [Netlify Community](https://community.netlify.com/)

## Next Steps

After deployment:

1. ✅ Set up custom domain
2. ✅ Configure email templates in Netlify Identity
3. ✅ Add more exam data
4. ✅ Set up monitoring and analytics
5. ✅ Enable additional external providers

---

**🎉 You're all set! Start preparing for your certification exams with AnkiQuiz!** 