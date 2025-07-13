# AnkiQuiz Deployment Guide

## Environment Configuration

### 1. Local Development Setup

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Edit `.env` file with your local configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
NETLIFY_DATABASE_URL=postgresql://username:password@localhost:5432/ankiquiz
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ankiquiz
DB_USER=username
DB_PASSWORD=password

# API Configuration
API_BASE_URL=http://localhost:3000/api
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Security
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here

# Logging
LOG_LEVEL=info
```

### 2. Production Environment Variables

For Netlify deployment, set these environment variables in the Netlify dashboard:

#### Required Variables:
- `NODE_ENV`: `production`
- `API_BASE_URL`: Your production API URL (e.g., `https://your-api-domain.com/api`)

#### Optional Variables:
- `ENABLE_ANALYTICS`: `true` or `false`
- `ENABLE_DEBUG`: `false` (for production)
- `DEFAULT_EXAM_TIME`: `180`
- `MAX_QUESTIONS_PER_EXAM`: `100`

## Netlify Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure your repository is on GitHub/GitLab/Bitbucket**
2. **Verify all files are committed:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

### Step 2: Connect to Netlify

1. **Go to [Netlify](https://netlify.com)**
2. **Sign up/Login with your Git provider**
3. **Click "New site from Git"**
4. **Choose your repository**

### Step 3: Configure Build Settings

In the Netlify build settings:

- **Build command:** `npm run build`
- **Publish directory:** `.` (root directory)
- **Node version:** `18` (or your preferred version)

### Step 4: Set Environment Variables

In Netlify dashboard → Site settings → Environment variables:

```
NODE_ENV=production
API_BASE_URL=https://your-api-domain.com/api
ENABLE_ANALYTICS=false
ENABLE_DEBUG=false
DEFAULT_EXAM_TIME=180
MAX_QUESTIONS_PER_EXAM=100
```

### Step 5: Configure Domain (Optional)

1. **Go to Site settings → Domain management**
2. **Add custom domain** (if you have one)
3. **Configure SSL certificate** (Netlify provides free SSL)

## API Backend Deployment

Since Netlify is for static sites, you'll need to deploy your API separately:

### Option 1: Heroku
```bash
# Install Heroku CLI
heroku create your-ankiquiz-api
heroku config:set NODE_ENV=production
heroku config:set NETLIFY_DATABASE_URL=your-postgres-url
git push heroku main
```

### Option 2: Railway
1. Connect your repository to Railway
2. Set environment variables
3. Deploy automatically

### Option 3: DigitalOcean App Platform
1. Create new app from Git repository
2. Configure environment variables
3. Deploy

## Post-Deployment Configuration

### 1. Update API URL
After deploying your API, update the `API_BASE_URL` in Netlify environment variables.

### 2. Test the Application
1. Visit your Netlify site
2. Test exam functionality
3. Verify API connections

### 3. Monitor Performance
- Check Netlify analytics
- Monitor API response times
- Set up error tracking (optional)

## Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Check build logs in Netlify dashboard

2. **API connection errors:**
   - Verify `API_BASE_URL` is correct
   - Check CORS settings on your API
   - Ensure API is accessible from Netlify

3. **Static assets not loading:**
   - Check file paths in HTML
   - Verify all files are in the correct directories
   - Check Netlify redirects configuration

### Debug Mode:
Set `ENABLE_DEBUG=true` in environment variables to see detailed console logs.

## Security Considerations

1. **Environment Variables:** Never commit `.env` files
2. **API Keys:** Use environment variables for all sensitive data
3. **CORS:** Configure your API to allow requests from your Netlify domain
4. **HTTPS:** Netlify provides free SSL certificates

## Performance Optimization

1. **Enable Netlify's CDN** (automatic)
2. **Use asset optimization** (configured in `netlify.toml`)
3. **Implement caching strategies** (configured in headers)
4. **Monitor Core Web Vitals** in Netlify analytics

## Maintenance

1. **Regular updates:** Keep dependencies updated
2. **Monitor logs:** Check Netlify function logs
3. **Backup data:** Ensure your database is backed up
4. **Security updates:** Keep security dependencies updated

## Support

For issues with:
- **Netlify deployment:** Check Netlify documentation
- **API issues:** Check your API provider's documentation
- **Application bugs:** Check browser console and network tab 