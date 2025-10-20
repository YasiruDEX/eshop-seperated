#!/bin/bash
# Build and setup messaging service

echo "Building messaging service..."
npx nx build messaging-service --skip-nx-cache

echo "Installing dependencies..."
cd dist/apps/messaging-service
npm install

echo "✅ Build complete! Run with: npm run messaging-service from root"
