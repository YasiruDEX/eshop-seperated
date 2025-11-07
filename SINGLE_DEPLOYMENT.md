# Deploy All Services in Single Render Instance

## ✅ Recommended: Option 1 - Docker Multi-Service

This approach runs all services in a single Docker container using PM2 process manager.

### Benefits:
- ✅ Only 1 free Render service needed (instead of 10+)
- ✅ All services share memory and can communicate via localhost
- ✅ No cold starts between services
- ✅ Easier to manage
- ⚠️ If one service crashes, you can restart just that process

### Setup Steps:

1. **Update API Gateway Service URLs** in `api-gateway/.env.production`:
   ```bash
   AUTH_SERVICE_URL=http://localhost:6001
   CATALOGUE_SERVICE_URL=http://localhost:6002
   REVIEW_SERVICE_URL=http://localhost:6005
   CHECKOUT_SERVICE_URL=http://localhost:6004
   ORDER_SERVICE_URL=http://localhost:6009
   CUSTOMER_SERVICE_URL=http://localhost:6008
   INVENTORY_SERVICE_URL=http://localhost:6006
   PAYMENT_SERVICE_URL=http://localhost:6010
   ```

2. **Deploy to Render**:
   - Go to Render Dashboard
   - Create New → Web Service
   - Connect your GitHub repo
   - Choose "Docker" environment
   - Point to the root `Dockerfile`
   - Port: `8080` (API Gateway port)
   - Add environment variables (database URLs, JWT secrets, etc.)

3. **Test the Deployment**:
   ```bash
   curl https://your-service.onrender.com/gateway-health
   curl https://your-service.onrender.com/api/catalogue/filter
   ```

### Files Created:
- ✅ `Dockerfile` - Multi-stage Docker build for all services
- ✅ `ecosystem.config.js` - PM2 configuration to run all services
- ✅ `render-all-services.yaml` - Render deployment config
- ✅ `.dockerignore` - Exclude unnecessary files

### Memory Management:
Render free tier gives 512MB RAM. Services are configured with:
- API Gateway: 512MB max
- Other services: 256MB max each
- Total: ~2GB needed (upgrade to Starter plan $7/mo for 2GB)

---

## Option 2 - Without Docker (Not Recommended)

Use Render's background workers, but this still creates multiple services.

### Limitations:
- ❌ Still counts as multiple free services
- ❌ Workers can't communicate via localhost
- ❌ Need external URLs for inter-service communication
- ❌ Cold starts still happen

---

## 🚀 Recommended Action:

**Use Option 1 (Docker)** and upgrade to Render's **Starter Plan ($7/month)** which gives you 2GB RAM - enough to run all services comfortably in one container.

Alternatively, keep using multiple free services but accept the cold start delays.

## Testing Locally:

```bash
# Build and test with Docker locally first
docker build -t eshop-all-services .
docker run -p 8080:8080 --env-file .env eshop-all-services

# Or test with PM2 directly
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs
```

## Monitoring Services:

Once deployed, you can check PM2 status:
```bash
# SSH into Render instance (if available) or check logs
pm2 list
pm2 logs api-gateway
pm2 restart auth-service
```
