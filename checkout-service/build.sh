#!/bin/bash

echo "🛒 Building Checkout Service..."

# Navigate to the service directory
cd "$(dirname "$0")"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

# Build with Nx
echo "🔨 Building with Nx..."
cd ../..
npx nx build checkout-service

echo "✅ Build complete! Run with: npm run checkout-service"
