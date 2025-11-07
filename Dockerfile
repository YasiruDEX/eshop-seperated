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

# Install dependencies and build each service separately for better error reporting
RUN echo "Building api-gateway..." && \
    cd api-gateway && npm ci && npm run build && \
    echo "✓ api-gateway built successfully"

RUN echo "Building auth-service..." && \
    cd auth-service && npm ci && npm run build && \
    echo "✓ auth-service built successfully"

RUN echo "Building catalogue-service..." && \
    cd catalogue-service && npm ci && npm run build && \
    echo "✓ catalogue-service built successfully"

RUN echo "Building checkout-service..." && \
    cd checkout-service && npm ci && npm run build && \
    echo "✓ checkout-service built successfully"

RUN echo "Building customer-service..." && \
    cd customer-service && npm ci && npm run build && \
    echo "✓ customer-service built successfully"

RUN echo "Building inventory-service..." && \
    cd inventory-service && npm ci && npm run build && \
    echo "✓ inventory-service built successfully"

RUN echo "Building order-service..." && \
    cd order-service && npm ci && npm run build && \
    echo "✓ order-service built successfully"

RUN echo "Building payment-service..." && \
    cd payment-service && npm ci && npm run build && \
    echo "✓ payment-service built successfully"

RUN echo "Building review-service..." && \
    cd review-service && npm ci && npm run build && \
    echo "✓ review-service built successfully"

# Copy PM2 ecosystem file
COPY ecosystem.config.js .

# Expose all service ports
EXPOSE 8080 6001 6002 6003 6004 6005 6006 6007

# Start all services with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
