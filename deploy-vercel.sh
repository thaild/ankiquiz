#!/bin/bash

# Vercel Deployment Script for AnkiQuiz
# This script helps deploy your AnkiQuiz application to Vercel

echo "🚀 AnkiQuiz Vercel Deployment Script"
echo "====================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    vercel login
fi

# Check for environment variables
echo "🔍 Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "📝 Please create .env file with your environment variables"
    echo "   You can copy from env.example: cp env.example .env"
fi

# Create .env.local for Vercel
if [ -f ".env" ]; then
    echo "📋 Creating .env.local for Vercel..."
    cp .env .env.local
    echo "✅ .env.local created"
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "📝 Follow the prompts:"
echo "   - Set up and deploy? Yes"
echo "   - Which scope? (your account)"
echo "   - Link to existing project? No (for first deployment)"
echo "   - Project name: ankiquiz"
echo "   - Directory: ./"
echo "   - Override settings? No"
echo ""

vercel

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your app should be available at the URL shown above"
echo ""
echo "📋 Next steps:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Test your API endpoints"
echo "   3. Configure custom domain (optional)"
echo ""
echo "🔗 Useful commands:"
echo "   vercel --prod          # Deploy to production"
echo "   vercel ls              # List deployments"
echo "   vercel logs            # View logs"
echo "   vercel rm <project>    # Remove project"
