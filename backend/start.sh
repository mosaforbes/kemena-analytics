#!/bin/bash
# Production startup script for Railway

echo "🚀 Starting Kemena Analytics Backend..."

# Run database migrations
echo "📦 Running database migrations..."
npm run migrate

# Start the server
echo "🎵 Starting API server..."
npm start
