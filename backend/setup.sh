#!/bin/bash
# Quick setup script for Kemena Analytics backend

set -e

echo "🎵 Kemena Analytics Backend - Quick Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Navigate to backend
cd "$(dirname "$0")/backend" || exit 1

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Update .env with your API keys:"
    echo "   - SPOTIFY_CLIENT_ID"
    echo "   - SPOTIFY_CLIENT_SECRET"
    echo "   - SPOTIFY_REFRESH_TOKEN"
    echo "   - YOUTUBE_API_KEY"
fi

# Create database (optional - for local development)
echo ""
read -p "Do you want to set up the local database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Setting up database..."
    npm run migrate
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "1. Edit .env with your API credentials"
echo "2. Start development server: npm run dev"
echo "3. Visit http://localhost:5000"
echo ""
echo "🚀 For production deployment:"
echo "   Read: BACKEND_DEPLOYMENT.md"
