#!/bin/bash
# Build and setup inventory service

echo "Building inventory service..."
npx nx build inventory-service --skip-nx-cache

echo "Installing dependencies..."
cd dist/apps/inventory-service
npm install

echo "✅ Build complete! Run with: npm run inventory-service from root"
