# Multi-service Dockerfile for all backend services
FROM node:20-alpine

# Install PM2 globally to manage multiple processes
RUN npm install -g pm2

# Set working directory
WORKDIR /app

# Copy all services
COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY catalogue-service ./catalogue-service
COPY checkout-service ./checkout-service
COPY customer-service ./customer-service
COPY inventory-service ./inventory-service
COPY messaging-service ./messaging-service
COPY notification-service ./notification-service
COPY order-service ./order-service
COPY payment-service ./payment-service
COPY review-service ./review-service
COPY packages ./packages

# Install dependencies for all services
RUN cd api-gateway && npm ci && npm run build && \
    cd ../auth-service && npm ci && npm run build && \
    cd ../catalogue-service && npm ci && npm run build && \
    cd ../checkout-service && npm ci && npm run build && \
    cd ../customer-service && npm ci && npm run build && \
    cd ../inventory-service && npm ci && npm run build && \
    cd ../order-service && npm ci && npm run build && \
    cd ../payment-service && npm ci && npm run build && \
    cd ../review-service && npm ci && npm run build

# Copy PM2 ecosystem file
COPY ecosystem.config.js .

# Expose all service ports
EXPOSE 8080 6001 6002 6003 6004 6005 6006 6007

# Start all services with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
