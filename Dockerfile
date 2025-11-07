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

# Install dependencies and build each service separately
# Using npm ci --only=production after build to keep Prisma clients but remove dev deps

RUN echo "Building api-gateway..." && \
    cd api-gateway && npm ci && npm run build && \
    echo "✓ api-gateway built successfully"

RUN echo "Building auth-service..." && \
    cd auth-service && npm ci && \
    npx prisma generate && \
    npm run build && \
    echo "✓ auth-service built successfully"

# Build catalogue-service (custom Prisma schema path)
RUN echo "Building catalogue-service..." && \
    cd catalogue-service && npm ci && \
    npx prisma generate --schema=./prisma/catalogue.prisma && \
    npm run build && \
    echo "✓ catalogue-service built successfully"

RUN echo "Building checkout-service..." && \
    cd checkout-service && npm ci && \
    npx prisma generate && \
    npm run build && \
    echo "✓ checkout-service built successfully"

RUN echo "Building customer-service..." && \
    cd customer-service && npm ci && \
    npx prisma generate && \
    npm run build && \
    echo "✓ customer-service built successfully"

RUN echo "Building inventory-service..." && \
    cd inventory-service && npm ci && \
    npx prisma generate && \
    npm run build && \
    echo "✓ inventory-service built successfully"

RUN echo "Building order-service..." && \
    cd order-service && npm ci && \
    npx prisma generate && \
    npm run build && \
    echo "✓ order-service built successfully"

RUN echo "Building payment-service..." && \
    cd payment-service && npm ci && \
    npx prisma generate && \
    npm run build && \
    echo "✓ payment-service built successfully"

RUN echo "Building review-service..." && \
    cd review-service && npm ci && \
    npx prisma generate && \
    npm run build && \
    echo "✓ review-service built successfully"

# Build messaging-service  
RUN echo "Building messaging-service..." && \
    cd messaging-service && npm ci && \
    npx prisma generate && \
    npm run build && \
    echo "✓ messaging-service built successfully"

# Build notification-service (No Prisma)
RUN echo "Building notification-service..." && \
    cd notification-service && npm ci && \
    npm run build && \
    echo "✓ notification-service built successfully"

# Copy PM2 ecosystem file
COPY ecosystem.config.js .

# Create a startup script to regenerate Prisma clients at runtime
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Regenerating Prisma clients..."' >> /app/start.sh && \
    echo 'cd /app/auth-service && npx prisma generate' >> /app/start.sh && \
    echo 'cd /app/catalogue-service && npx prisma generate --schema=./prisma/catalogue.prisma' >> /app/start.sh && \
    echo 'cd /app/checkout-service && npx prisma generate' >> /app/start.sh && \
    echo 'cd /app/customer-service && npx prisma generate' >> /app/start.sh && \
    echo 'cd /app/inventory-service && npx prisma generate' >> /app/start.sh && \
    echo 'cd /app/order-service && npx prisma generate' >> /app/start.sh && \
    echo 'cd /app/payment-service && npx prisma generate' >> /app/start.sh && \
    echo 'cd /app/review-service && npx prisma generate' >> /app/start.sh && \
    echo 'cd /app/messaging-service && npx prisma generate' >> /app/start.sh && \
    echo 'echo "✓ All Prisma clients regenerated"' >> /app/start.sh && \
    echo 'cd /app' >> /app/start.sh && \
    echo 'exec pm2-runtime start ecosystem.config.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose all service ports
EXPOSE 8080 6001 6002 6003 6004 6005 6006 6007 6009 6010

# Start all services with PM2 via startup script
CMD ["/app/start.sh"]
