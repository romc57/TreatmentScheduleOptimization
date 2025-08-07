#!/bin/bash

echo "🔄 Resetting Frontend Server..."

# Kill any running React development servers
echo "📋 Cleaning up any running React servers..."
kill -9 $(lsof -t -i:3000) 2>/dev/null || true

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Remove node_modules and package-lock
echo "🗑️ Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📦 Reinstalling dependencies..."
npm install

# Start development server
echo "🚀 Starting development server..."
npm start
