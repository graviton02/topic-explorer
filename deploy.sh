#!/bin/bash

# Topic Explorer - Quick Deploy Script
echo "🚀 Topic Explorer - Quick Deploy Script"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the topic-explorer-app directory"
    exit 1
fi

echo "📋 Pre-deployment checks..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check for errors."
    exit 1
fi

echo "✅ Build successful!"

echo ""
echo "🎯 Deployment Options:"
echo "1. Vercel (Recommended)"
echo "2. Netlify"
echo "3. Manual deployment"
echo ""

read -p "Choose deployment option (1-3): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            echo "📡 Checking Vercel login status..."
            if vercel whoami &> /dev/null; then
                echo "✅ Logged in to Vercel"
                vercel --prod
            else
                echo "🔐 Please login to Vercel first:"
                vercel login
                echo "After login, run: vercel --prod"
            fi
        else
            echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
        fi
        ;;
    2)
        echo "🚀 Preparing for Netlify deployment..."
        if command -v netlify &> /dev/null; then
            echo "📡 Checking Netlify login status..."
            if netlify status &> /dev/null; then
                echo "✅ Logged in to Netlify"
                netlify deploy --prod --dir=dist
            else
                echo "🔐 Please login to Netlify first:"
                netlify login
                echo "After login, run: netlify deploy --prod --dir=dist"
            fi
        else
            echo "❌ Netlify CLI not found. Install with: npm i -g netlify-cli"
            echo "Or upload the 'dist' folder manually to Netlify"
        fi
        ;;
    3)
        echo "📁 Manual deployment instructions:"
        echo "1. Upload the 'dist' folder to your hosting provider"
        echo "2. Set the following environment variables:"
        echo "   - VITE_SUPABASE_URL: https://ddwyhxmhqibspcielxhc.supabase.co"
        echo "   - VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkd3loeG1ocWlic3BjaWVseGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1Nzc0NDksImV4cCI6MjA2MzE1MzQ0OX0.Mf7UONLZdJVQi_mFcDOo0vJdz_IOCN5QrEQFAqKOI4Y"
        echo "3. Configure routing for single-page application"
        ;;
    *)
        echo "❌ Invalid option. Please choose 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "🎉 Your Topic Explorer app is ready!"
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo "🔗 Share the deployed URL with your friends!"