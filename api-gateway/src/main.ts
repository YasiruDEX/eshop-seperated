/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// Disable SSL verification for development (needed for Render proxy)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import axios from "axios";
import cookieParser from "cookie-parser";

const app = express();

// Get service URLs from environment variables
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "https://eshop-auth-uq9z.onrender.com";
const CATALOGUE_SERVICE_URL =
  process.env.CATALOGUE_SERVICE_URL || "https://eshop-catalogue.onrender.com";
const REVIEW_SERVICE_URL =
  process.env.REVIEW_SERVICE_URL || "https://eshop-reviews.onrender.com";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:6003";
const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL || "https://eshop-seperated.onrender.com";
const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || "https://eshop-inventory.onrender.com";
const MESSAGING_SERVICE_URL =
  process.env.MESSAGING_SERVICE_URL || "http://localhost:6007";
const CHECKOUT_SERVICE_URL =
  process.env.CHECKOUT_SERVICE_URL || "https://eshop-checkout.onrender.com";
const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || "https://eshop-orders.onrender.com";
const CUSTOMER_SERVICE_URL =
  process.env.CUSTOMER_SERVICE_URL ||
  "https://eshop-customer-880k.onrender.com";
const AI_SEARCH_SERVICE_URL =
  process.env.AI_SEARCH_SERVICE_URL ||
  "https://0f195hsk-3004.inc1.devtunnels.ms";

// Configure CORS origins from environment variable or sensible defaults
const envOrigins = process.env.CORS_ALLOWED_ORIGINS || "";
const allowedOrigins = envOrigins
  ? envOrigins
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://eshop-seperated.vercel.app",
      "https://eshop-seller.vercel.app",
      "https://console.cron-job.org",
      // include any public tunnel or API url set in user UI env for convenience
      process.env.NEXT_PUBLIC_GATEWAY_URL || "",
      process.env.NEXT_PUBLIC_API_URL || "",
    ].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      // allow subdomains of allowed origins (useful for vercel preview domains)
      const matched = allowedOrigins.some((o) => {
        try {
          const parsed = new URL(o);
          return origin.endsWith(parsed.host);
        } catch (e) {
          return false;
        }
      });
      if (matched) return callback(null, true);
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: ["set-cookie", "Set-Cookie"],
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // Limit each IP to 100 requests per windowMs for unauthenticated users, 1000 for authenticated users
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  // Remove custom keyGenerator to use the default one which handles IPv6 correctly
});
app.use(limiter);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

// Debug endpoint to check service URLs (only in non-production)
app.get("/gateway-config", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Not available in production" });
  }
  res.json({
    AUTH_SERVICE_URL,
    CATALOGUE_SERVICE_URL,
    REVIEW_SERVICE_URL,
    NOTIFICATION_SERVICE_URL,
    PAYMENT_SERVICE_URL,
    INVENTORY_SERVICE_URL,
    MESSAGING_SERVICE_URL,
    CHECKOUT_SERVICE_URL,
    ORDER_SERVICE_URL,
    CUSTOMER_SERVICE_URL,
    AI_SEARCH_SERVICE_URL,
  });
});

// Create an Express router for API routes
const apiRouter = express.Router();

// Proxy error handler
const proxyErrorHandler = (serviceName: string, serviceUrl: string) => {
  return (err: any, req: any, res: any, next: any) => {
    console.error(`[${serviceName}] Proxy Error:`, err.message);
    console.error(`[${serviceName}] Target URL:`, serviceUrl);
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `Cannot connect to ${serviceName}. The service might be starting up or unavailable.`,
        service: serviceName,
        target: serviceUrl
      });
    }
    
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message,
      service: serviceName
    });
  };
};

// Specific routes first (before wildcard)
apiRouter.use(
  "/auth",
  proxy(AUTH_SERVICE_URL, {
    https: true,
    timeout: 30000, // 30 second timeout
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Forward cookies from the original request
      if (srcReq.headers.cookie) {
        proxyReqOpts.headers = proxyReqOpts.headers || {};
        proxyReqOpts.headers["cookie"] = srcReq.headers.cookie;
      }
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      // Forward Set-Cookie headers from the proxied response
      if (proxyRes.headers["set-cookie"]) {
        userRes.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
      }
      return proxyResData;
    },
  })
); // Auth Service
apiRouter.use(
  "/seller-shop",
  proxy(AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/seller-shop${req.url}`,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Forward cookies from the original request
      if (srcReq.headers.cookie) {
        proxyReqOpts.headers = proxyReqOpts.headers || {};
        proxyReqOpts.headers["cookie"] = srcReq.headers.cookie;
      }
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      // Forward Set-Cookie headers from the proxied response
      if (proxyRes.headers["set-cookie"]) {
        userRes.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
      }
      return proxyResData;
    },
  })
); // Seller Shop (Auth Service)
apiRouter.use(
  "/catalogue",
  proxy(CATALOGUE_SERVICE_URL, {
    timeout: 30000,
    proxyReqPathResolver: (req) => {
      // Map /api/catalogue/* to /products/*
      const path = req.url;
      const targetPath = path.startsWith("/products")
        ? path
        : `/products${path}`;
      console.log(
        `[Catalogue Proxy] ${req.method} /api/catalogue${path} -> ${targetPath}`
      );
      return targetPath;
    },
  })
); // Catalogue Service
apiRouter.use(
  "/notifications",
  proxy(NOTIFICATION_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/notifications${req.url}`, // Preserve full path
  })
); // Notification Service
apiRouter.use(
  "/payments",
  proxy(PAYMENT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/payments${req.url}`, // Preserve full path
  })
); // Payment Service
apiRouter.use(
  "/reviews",
  proxy(REVIEW_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/reviews${req.url}`, // Preserve full path
  })
); // Review Service
apiRouter.use(
  "/inventory",
  proxy(INVENTORY_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/inventory${req.url}`, // Preserve full path
  })
); // Inventory Service
apiRouter.use(
  "/messages",
  proxy(MESSAGING_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/messages${req.url}`, // Preserve full path
  })
); // Messaging Service
apiRouter.use(
  "/cart",
  proxy(CHECKOUT_SERVICE_URL, {
    timeout: 30000,
    proxyReqPathResolver: (req) => `/cart${req.url}`, // Preserve full path
  })
); // Checkout Service
apiRouter.use(
  "/wishlist",
  proxy(CHECKOUT_SERVICE_URL, {
    timeout: 30000,
    proxyReqPathResolver: (req) => `/wishlist${req.url}`, // Preserve full path
  })
); // Checkout Service - Wishlist
apiRouter.use(
  "/orders",
  proxy(ORDER_SERVICE_URL, {
    timeout: 30000,
    proxyReqPathResolver: (req) => `/orders${req.url}`, // Preserve full path
  })
); // Order Service
apiRouter.use(
  "/profiles",
  proxy(CUSTOMER_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/profiles${req.url}`, // Map to customer service
  })
); // Customer Service
apiRouter.use(
  "/ai-search",
  proxy(AI_SEARCH_SERVICE_URL, {
    https: true,
    proxyReqPathResolver: (req) => req.url,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.headers.cookie) {
        proxyReqOpts.headers = proxyReqOpts.headers || {};
        proxyReqOpts.headers["cookie"] = srcReq.headers.cookie;
      }
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      if (proxyRes.headers["set-cookie"]) {
        userRes.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
      }
      return proxyResData;
    },
  })
); // AI Search Service

// Register the API router under /api prefix
app.use("/api", apiRouter);

// For backward compatibility, also mount routes at the root level
app.use("/", apiRouter);

// Global error handler for proxy errors
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Global Error Handler:', err);
  
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Cannot connect to the backend service. It may be starting up or temporarily unavailable. Please try again in a moment.',
      code: err.code
    });
  }
  
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      error: 'Gateway Timeout',
      message: 'The backend service took too long to respond. Please try again.',
      code: err.code
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 API GATEWAY STARTED`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Listening at: http://localhost:${port}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📡 CONFIGURED MICROSERVICES:`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  🔐 Auth Service:         ${AUTH_SERVICE_URL}`);
  console.log(`  📦 Catalogue Service:    ${CATALOGUE_SERVICE_URL}`);
  console.log(`  ⭐ Review Service:       ${REVIEW_SERVICE_URL}`);
  console.log(`  🔔 Notification Service: ${NOTIFICATION_SERVICE_URL}`);
  console.log(`  💳 Payment Service:      ${PAYMENT_SERVICE_URL}`);
  console.log(`  📊 Inventory Service:    ${INVENTORY_SERVICE_URL}`);
  console.log(`  💬 Messaging Service:    ${MESSAGING_SERVICE_URL}`);
  console.log(`  🛒 Checkout Service:     ${CHECKOUT_SERVICE_URL}`);
  console.log(`  📋 Order Service:        ${ORDER_SERVICE_URL}`);
  console.log(`  👤 Customer Service:     ${CUSTOMER_SERVICE_URL}`);
  console.log(`  🤖 AI Search Service:    ${AI_SEARCH_SERVICE_URL}`);
  console.log(`${'='.repeat(60)}\n`);
});
server.on("error", console.error);
