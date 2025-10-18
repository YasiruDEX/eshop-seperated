#!/bin/bash
# Build and setup catalogue service

echo "Building catalogue service..."
npx nx build catalogue-service --skip-nx-cache

echo "Installing dependencies..."
cd dist/apps/catalogue-service
npm install

echo "Copying Prisma client..."
rm -rf node_modules/@prisma/catalogue-client
cp -r ../../../node_modules/@prisma/catalogue-client node_modules/@prisma/

echo "✅ Build complete! Run with: node dist/apps/catalogue-service/main.js"
