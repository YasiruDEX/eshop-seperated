/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import axios from "axios";
import cookieParser from "cookie-parser";

const app = express();

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

// Specific routes first (before /api wildcard)
app.use(
  "/auth",
  proxy("https://eshop-auth-uq9z.onrender.com/api", {
    preserveHostHdr: true,
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
); // Backwards compatibility
app.use(
  "/catalogue",
  proxy("https://eshop-catalogue.onrender.com", {
    proxyReqPathResolver: (req) => {
      // Map /catalogue/* to /products/*
      // But if the path already starts with /products, don't add it again
      const path = req.url;
      const targetPath = path.startsWith("/products")
        ? path
        : `/products${path}`;
      console.log(
        `[Catalogue Proxy] ${req.method} /catalogue${path} -> ${targetPath}`
      );
      return targetPath;
    },
  })
); // Catalogue Service
app.use(
  "/notifications",
  proxy("http://localhost:6003", {
    proxyReqPathResolver: (req) => `/notifications${req.url}`, // Preserve full path
  })
); // Notification Service
app.use(
  "/payments",
  proxy("https://eshop-seperated.onrender.com", {
    proxyReqPathResolver: (req) => `/payments${req.url}`, // Preserve full path
  })
); // Payment Service
app.use(
  "/reviews",
  proxy("http://localhost:6005", {
    proxyReqPathResolver: (req) => `/reviews${req.url}`, // Preserve full path
  })
); // Review Service
app.use(
  "/inventory",
  proxy("http://localhost:6010", {
    proxyReqPathResolver: (req) => `/inventory${req.url}`, // Preserve full path
  })
); // Inventory Service
app.use(
  "/messages",
  proxy("http://localhost:6007", {
    proxyReqPathResolver: (req) => `/messages${req.url}`, // Preserve full path
  })
); // Messaging Service
app.use(
  "/cart",
  proxy("http://localhost:6008", {
    proxyReqPathResolver: (req) => `/cart${req.url}`, // Preserve full path
  })
); // Checkout Service
app.use(
  "/wishlist",
  proxy("http://localhost:6008", {
    proxyReqPathResolver: (req) => `/wishlist${req.url}`, // Preserve full path
  })
); // Checkout Service - Wishlist
app.use(
  "/orders",
  proxy("http://localhost:6009", {
    proxyReqPathResolver: (req) => `/orders${req.url}`, // Preserve full path
  })
); // Order Service
app.use(
  "/profiles",
  proxy("http://localhost:6006", {
    proxyReqPathResolver: (req) => `/api/profiles${req.url}`, // Map to customer service
  })
); // Customer Service
app.use(
  "/ai-search",
  proxy("http://localhost:3004", {
    preserveHostHdr: true,
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

// Route all /api/* requests to auth service
app.use("/api", (req, res, next) => {
  const proxyServer = proxy("https://eshop-auth-uq9z.onrender.com", {
    proxyReqPathResolver: () => req.baseUrl + req.url,
    preserveHostHdr: true,
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
  });
  return proxyServer(req, res, next);
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
