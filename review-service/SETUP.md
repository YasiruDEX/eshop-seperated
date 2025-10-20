# Review Service - Standalone Setup Guide

## Overview
The Review Service has been successfully configured to run independently without Nx.

## Setup Steps Completed

### 1. **Updated package.json**
```json
"scripts": {
  "build": "tsc",
  "dev": "ts-node src/main.ts",
  "start": "node dist/main.js"
}
```
Added `ts-node` as a dev dependency for development mode.

### 2. **Updated tsconfig.json**
Converted from Nx workspace configuration to standalone TypeScript configuration:
- Removed `extends: "../../tsconfig.base.json"`
- Set `outDir` to `./dist`
- Set `target` to `ES2020`
- Set `module` to `commonjs`

### 3. **Generated Prisma Client**
```bash
npx prisma generate
```
Generated Prisma client from `prisma/schema.prisma` to `../../generated/prisma-review`

### 4. **Removed External Dependencies**
- Removed import of `@prisma/catalogue-client` from review service
- Service now only uses its own review database through Prisma

## Running the Service

### Development Mode (with ts-node)
```bash
cd review-service
npm install
REVIEW_SERVICE_PORT=6005 npm run dev
```

### Production Mode (compiled JavaScript)
```bash
cd review-service
npm install
npm run build
REVIEW_SERVICE_PORT=6005 npm start
```

## API Endpoints

### Health Check
```bash
curl -X GET http://localhost:6005/health
```

### Submit Review
```bash
curl -X POST http://localhost:6005/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "rating": 5,
    "comment": "Great product!",
    "verified": true
  }'
```

### Get Reviews for Item
```bash
curl -X GET http://localhost:6005/reviews/item/507f1f77bcf86cd799439011
```

### Get Review Statistics
```bash
curl -X GET http://localhost:6005/reviews/stats/507f1f77bcf86cd799439011
```

### Mark Review as Helpful
```bash
curl -X POST http://localhost:6005/reviews/helpful/{reviewId}
```

### Get Reviews by Order ID
```bash
curl -X GET http://localhost:6005/reviews/order/{orderId}
```

## Test Results ✅

All endpoints tested and working:

1. **Health Check** - Returns service status ✅
2. **Submit Review** - Creates review with valid data ✅
3. **Get Reviews** - Retrieves reviews for an item ✅
4. **Review Stats** - Returns aggregated rating data ✅
5. **Mark Helpful** - Increments helpful counter ✅

## Environment Variables

Ensure `.env` file has:
```
REVIEWS_DATABASE_URL=mongodb+srv://...
REVIEW_SERVICE_PORT=6005
```

## Notes

- Service uses MongoDB for storage
- All product IDs and user IDs must be valid MongoDB ObjectIds (24 hex characters)
- Rating must be between 1-5
- Service automatically calculates average rating and review count
