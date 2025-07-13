# 🚀 Quick Start Guide - Deploy to Netlify

## Prerequisites
- GitHub/GitLab/Bitbucket account
- Netlify account (free)
- API backend deployed (Heroku/Railway/DigitalOcean)

## Step 1: Prepare Your Code

1. **Run environment setup:**
   ```bash
   npm run setup
   ```

2. **Edit environment variables:**
   ```bash
   # Copy example file
   cp env.example .env
   
   # Edit .env with your settings
   nano .env
   ```

3. **Commit and push to Git:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

## Step 2: Deploy API Backend

Choose one of these options:

### Option A: Heroku (Recommended)
```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create your-ankiquiz-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set NETLIFY_DATABASE_URL=your-postgres-url
heroku config:set JWT_SECRET=your-secret-key
heroku config:set SESSION_SECRET=your-session-secret

# Deploy
git push heroku main
```

### Option B: Railway
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy automatically

## Step 3: Deploy to Netlify

1. **Go to [Netlify](https://netlify.com)**
2. **Click "New site from Git"**
3. **Choose your repository**
4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `.`
   - Node version: `18`

5. **Set environment variables in Netlify dashboard:**
   ```
   NODE_ENV=production
   API_BASE_URL=https://your-api-domain.com/api
   ENABLE_ANALYTICS=false
   ENABLE_DEBUG=false
   ```

6. **Deploy!**

## Step 4: Configure Domain

1. **Go to Site settings → Domain management**
2. **Add custom domain** (optional)
3. **SSL certificate** is automatically provided

## Step 5: Test Your Application

1. **Visit your Netlify site**
2. **Test exam functionality**
3. **Verify API connections**
4. **Check browser console for errors**

## Troubleshooting

### Build Fails
- Check Node.js version (use 18)
- Verify all dependencies in `package.json`
- Check build logs in Netlify dashboard

### API Connection Errors
- Verify `API_BASE_URL` is correct
- Check CORS settings on your API
- Ensure API is accessible from Netlify domain

### Static Assets Not Loading
- Check file paths in HTML
- Verify all files are in correct directories
- Check Netlify redirects configuration

## Environment Variables Reference

### Required for Production:
```
NODE_ENV=production
API_BASE_URL=https://your-api-domain.com/api
```

### Optional:
```
ENABLE_ANALYTICS=false
ENABLE_DEBUG=false
DEFAULT_EXAM_TIME=180
MAX_QUESTIONS_PER_EXAM=100
```

## Support

- **Netlify Issues:** Check Netlify documentation
- **API Issues:** Check your API provider's documentation
- **Application Bugs:** Check browser console and network tab

## Next Steps

After successful deployment:
1. Set up monitoring and analytics
2. Configure custom domain
3. Set up CI/CD pipeline
4. Implement error tracking

---

**🎉 Congratulations! Your AnkiQuiz application is now live on Netlify!** 