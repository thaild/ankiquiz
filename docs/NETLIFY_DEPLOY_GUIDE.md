# Netlify Auto-Deploy & Cache Management

## 🚀 Automatic Deployment for Exam Data Updates

This guide explains how the automatic deployment system works for managing exam data updates.

### Configured Settings

1. **Netlify Configuration (`netlify.toml`)**:
   - ✅ No caching for `index.json` files (always load fresh data)
   - ✅ Automatic deployment on file changes
   - ✅ Cache static assets for performance

2. **Build Scripts**:
   - ✅ `npm run build` - Generate index files + build
   - ✅ `npm run clear-cache` - Clear Netlify cache
   - ✅ `npm run generate-indexes` - Generate index files only

3. **Automatic Deployment**:
   - ✅ Auto-deploy when pushing changes to `public/data/**`
   - ✅ Generate index files before deploy
   - ✅ Clear cache and deploy fresh data

## 📋 How to Use

### 1. Adding New Exam Data

```bash
# Add/edit/delete .js files in exam directories
# Example: public/data/examtopics/SAA-C03/new_questions.js

# Commit and push
git add .
git commit -m "Add new exam questions"
git push origin main
```

### 2. Manual Deploy (If Needed)

```bash
# Generate index files
npm run generate-indexes

# Build and deploy
npm run build

# Clear cache (if needed)
npm run clear-cache
```

### 3. Check Deployment

- Netlify will automatically deploy
- Fresh data will be available immediately
- `index.json` files will load fresh (not cached)

## 🔧 Netlify Configuration

### Required Environment Variables

```bash
NETLIFY_DATABASE_URL=your_postgres_url
NODE_ENV=production
```

### Cache Headers

Configured in `netlify.toml`:

- `index.json` files: `no-cache, no-store, must-revalidate`
- Static assets: `max-age=31536000, immutable`
- HTML files: `max-age=0, must-revalidate`

## 🎯 Expected Results

✅ **Automatic deployment** when data changes  
✅ **No caching** for `index.json` files  
✅ **Fresh data** on every load  
✅ **Better performance** for static assets  
✅ **Zero maintenance** - automatic operation

## 🚨 Troubleshooting

### Cache Won't Clear

```bash
# Force clear cache
npm run clear-cache

# Or manually clear in Netlify dashboard
# Site settings > Build & deploy > Post processing > Clear cache
```

### Automatic Deployment Not Working

- Check Netlify deployment logs
- Verify Git integration is connected
- Check file paths in repository
- Ensure `netlify.toml` is in repository root

### Index.json Not Updating

```bash
# Check the generate-indexes script
npm run generate-indexes

# Verify .js files are in exam folders
# Run manually if needed
```

## 📊 How Index Files Work

The system generates index files for faster loading:

### Master Index (`public/data/master-index.json`)
- Lists all available exams
- Shows file counts per exam
- Updated automatically

### Per-Exam Indexes
- Located in each exam's folder
- Lists all question files
- Enables fast discovery

## 🔄 Deployment Flow

```
1. Developer adds new exam files
2. Commits and pushes to Git
3. Netlify detects changes
4. Runs npm run build
5. Generates new index files
6. Deploys to CDN
7. Fresh data available instantly
```

## 📝 Best Practices

1. **Organize files consistently** - Use standard naming patterns
2. **Generate indexes before commit** - Run `npm run generate-indexes`
3. **Test locally first** - Ensure files load correctly before deploying
4. **Monitor deployment logs** - Check for errors in Netlify dashboard
5. **Clear cache when needed** - Use `npm run clear-cache` for stubborn cache

## 🎓 Advanced Usage

### Custom Build Process

You can customize the build process in `package.json`:

```json
{
  "scripts": {
    "build": "node scripts/build-and-generate.js",
    "prebuild": "npm run generate-indexes"
  }
}
```

### Watch Mode

For development, use watch mode:

```bash
npm run watch-indexes
```

This automatically regenerates indexes when files change.

## 💡 Tips

- **Large datasets**: Consider splitting into multiple files
- **Performance**: Use the master index for initial load
- **Debugging**: Check browser console for loading errors
- **Testing**: Use Netlify's deploy previews to test changes

---

For more information, see:
- [Auto-Loading Guide](./AUTO_LOADING_GUIDE.md)
- [Database Integration](./DATABASE_INTEGRATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)