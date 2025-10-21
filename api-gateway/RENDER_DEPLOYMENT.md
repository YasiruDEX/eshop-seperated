# API Gateway - Render Deployment Setup

## Environment Variables to Set in Render Dashboard

Go to your API Gateway service in Render → Environment → Add the following environment variables:

```
NODE_ENV=production
PORT=8080

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://eshop-seperated.vercel.app,https://eshop-seller.vercel.app,https://console.cron-job.org

# Microservice URLs
AUTH_SERVICE_URL=https://eshop-auth-uq9z.onrender.com
CATALOGUE_SERVICE_URL=https://eshop-catalogue.onrender.com
REVIEW_SERVICE_URL=https://eshop-reviews.onrender.com
PAYMENT_SERVICE_URL=https://eshop-seperated.onrender.com
INVENTORY_SERVICE_URL=https://eshop-inventory.onrender.com
CHECKOUT_SERVICE_URL=https://eshop-checkout.onrender.com
ORDER_SERVICE_URL=https://eshop-orders.onrender.com
CUSTOMER_SERVICE_URL=https://eshop-customer-880k.onrender.com
AI_SEARCH_SERVICE_URL=https://0f195hsk-3004.inc1.devtunnels.ms
```

## Services that need to be deployed separately:

- ❌ **NOTIFICATION_SERVICE_URL** - Currently localhost only
- ❌ **MESSAGING_SERVICE_URL** - Currently localhost only

These services need to be deployed to Render/other platforms before they can work in production.

## How to Update

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `api-gateway` service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable listed above
6. Click **Save Changes**
7. Render will automatically redeploy with the new environment variables

## Verifying Deployment

After deployment, test the gateway health:
```bash
curl https://your-api-gateway-url.onrender.com/gateway-health
```

Expected response:
```json
{"message":"Welcome to api-gateway!"}
```
