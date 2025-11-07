// PM2 Ecosystem Configuration for all services
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      cwd: '/app/api-gateway',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
      }
    },
    {
      name: 'auth-service',
      cwd: '/app/auth-service',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 6001,
      }
    },
    {
      name: 'catalogue-service',
      cwd: '/app/catalogue-service',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 6002,
      }
    },
    {
      name: 'checkout-service',
      cwd: '/app/checkout-service',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 6004,
      }
    },
    {
      name: 'customer-service',
      cwd: '/app/customer-service',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 6008,
      }
    },
    {
      name: 'inventory-service',
      cwd: '/app/inventory-service',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 6006,
      }
    },
    {
      name: 'order-service',
      cwd: '/app/order-service',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 6009,
      }
    },
    {
      name: 'payment-service',
      cwd: '/app/payment-service',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 6010,
      }
    },
    {
      name: 'review-service',
      cwd: '/app/review-service',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 6005,
      }
    }
  ]
};
