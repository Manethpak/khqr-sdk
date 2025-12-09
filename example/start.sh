#!/bin/bash

# KHQR SDK Example App Setup and Run Script

echo "🚀 KHQR SDK Example App"
echo "======================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 20"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be >= 20. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install || npm install || yarn install
    echo ""
fi

# Build the main SDK first
echo "🔨 Building KHQR SDK..."
cd ..
pnpm build
cd example
echo ""

# Start the server
echo "🎯 Starting KHQR SDK Example App..."
echo "📖 Open http://localhost:3000 in your browser"
echo ""
pnpm dev
