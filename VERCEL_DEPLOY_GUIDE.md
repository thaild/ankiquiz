# Vercel Deployment Guide for AnkiQuiz

This guide will help you deploy your AnkiQuiz application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Node.js**: Ensure you have Node.js 14+ installed locally

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

## Step 3: Configure Environment Variables

Create a `.env.local` file for local development:

```bash
# Copy from your existing .env file
cp .env .env.local
```

For production, you'll need to set environment variables in Vercel dashboard:
- Go to your project settings in Vercel
- Navigate to "Environment Variables"
- Add your database connection strings and other secrets

## Step 4: Deploy to Vercel

### Option A: Deploy via CLI

```bash
# From your project root directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name: ankiquiz (or your preferred name)
# - Directory: ./
# - Override settings? No
```

### Option B: Deploy via GitHub Integration

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `./`
5. Click "Deploy"

## Step 5: Configure API Routes

Your API routes are configured in `vercel.json`:

- `/api/*` routes → `functions/api.cjs`
- All other routes → `index.html` (SPA)

## Step 6: Set Environment Variables

In Vercel dashboard, add these environment variables:

```bash
# Database Configuration
DATABASE_URL=your_postgresql_connection_string
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Application Configuration
NODE_ENV=production
API_BASE_URL=https://your-app.vercel.app/api
```

## Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test API endpoints:
   - `https://your-app.vercel.app/api/health`
   - `https://your-app.vercel.app/api/fake-api-1`
3. Check logs in Vercel dashboard

## Step 8: Custom Domain (Optional)

1. Go to project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Common Issues:

1. **Function Timeout**: Increase `maxDuration` in `vercel.json`
2. **Environment Variables**: Ensure all required env vars are set in Vercel dashboard
3. **Database Connection**: Verify your database allows connections from Vercel IPs
4. **Build Errors**: Check build logs in Vercel dashboard

### Useful Commands:

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm your-project-name
```

## File Structure for Vercel

```
ankiquiz/
├── vercel.json          # Vercel configuration
├── functions/
│   ├── api.cjs          # Netlify API function
│   ├── api-vercel.cjs   # Vercel API function (separate)
│   └── database.cjs     # Database utilities
├── index.html           # Main SPA file
├── public/              # Static assets
├── package.json         # Dependencies
└── .env.local           # Local environment (not deployed)
```

## Differences from Netlify

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Functions | `functions/` | `functions/` |
| Config | `netlify.toml` | `vercel.json` |
| Redirects | `[[redirects]]` | `"routes"` |
| Headers | `[[headers]]` | Not in config |
| Build | `npm run build` | `npm run build` |

## Next Steps

1. **Monitor Performance**: Use Vercel Analytics
2. **Set up CI/CD**: Automatic deployments on git push
3. **Add Monitoring**: Consider adding error tracking (Sentry, etc.)
4. **Optimize**: Use Vercel's Edge Functions for better performance

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Discord](https://vercel.com/discord)
