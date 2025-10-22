# Keep Services Warm - Cron Job Setup

Your services are sleeping on Render's free tier causing 500 errors. Set up these cron jobs to keep them warm.

## Setup Instructions

1. Go to https://console.cron-job.org
2. Create a free account
3. Add these cron jobs (run every 10 minutes):

## Cron Jobs to Create

### 1. Auth Service Health Check

- **URL**: `https://eshop-auth-uq9z.onrender.com/api/health`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Method**: GET

### 2. Catalogue Service Health Check

- **URL**: `https://eshop-catalogue.onrender.com/products/filter`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Method**: POST
- **Body**: `{"category":"all","limit":1}`
- **Headers**: `Content-Type: application/json`

### 3. Checkout Service Health Check

- **URL**: `https://eshop-checkout.onrender.com/cart/health`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Method**: GET

### 4. Order Service Health Check

- **URL**: `https://eshop-orders.onrender.com/orders/health`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Method**: GET

### 5. Customer Service Health Check

- **URL**: `https://eshop-customer-880k.onrender.com/api/health`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Method**: GET

### 6. Review Service Health Check

- **URL**: `https://eshop-reviews.onrender.com/reviews/health`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Method**: GET

### 7. Inventory Service Health Check

- **URL**: `https://eshop-inventory.onrender.com/inventory/health`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Method**: GET

### 8. API Gateway Health Check

- **URL**: `https://eshop-api-gateway-g686.onrender.com/gateway-health`
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Method**: GET

## Alternative: Create a Simple Warmup Script

Create a GitHub Action that runs every 10 minutes:

```yaml
# .github/workflows/keep-warm.yml
name: Keep Services Warm
on:
  schedule:
    - cron: "*/10 * * * *" # Every 10 minutes
  workflow_dispatch:

jobs:
  ping-services:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Services
        run: |
          curl -f https://eshop-api-gateway-g686.onrender.com/gateway-health || true
          curl -f https://eshop-auth-uq9z.onrender.com/api/health || true
          curl -f https://eshop-catalogue.onrender.com/products/filter -X POST -H "Content-Type: application/json" -d '{"category":"all","limit":1}' || true
          curl -f https://eshop-checkout.onrender.com/cart/health || true
          curl -f https://eshop-orders.onrender.com/orders/health || true
          curl -f https://eshop-customer-880k.onrender.com/api/health || true
          echo "All services pinged!"
```

## Why This Is Needed

- **Render Free Tier**: Services sleep after 15 minutes of inactivity
- **Wake-up Time**: Takes 30-60 seconds for a sleeping service to wake up
- **User Experience**: During wake-up, requests fail with 500 errors
- **Solution**: Keep services warm by pinging them every 10 minutes

## After Setup

Once cron jobs are running:

- ✅ Services stay active
- ✅ No more 500 errors from sleeping services
- ✅ Fast response times (no cold starts)
- ✅ Better user experience

## Note

This only works for Render's free tier services. If you upgrade to paid plans ($7/month per service), services stay always active without needing cron jobs.
