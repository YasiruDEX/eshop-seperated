"use strict";
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Disable SSL verification for development (needed for Render proxy)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
// Get service URLs from environment variables
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "https://eshop-auth-uq9z.onrender.com";
const CATALOGUE_SERVICE_URL = process.env.CATALOGUE_SERVICE_URL || "https://eshop-catalogue.onrender.com";
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || "https://eshop-reviews.onrender.com";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:6003";
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "https://eshop-seperated.onrender.com";
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || "https://eshop-inventory.onrender.com";
const MESSAGING_SERVICE_URL = process.env.MESSAGING_SERVICE_URL || "http://localhost:6007";
const CHECKOUT_SERVICE_URL = process.env.CHECKOUT_SERVICE_URL || "https://eshop-checkout.onrender.com";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "https://eshop-orders.onrender.com";
const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL ||
    "https://eshop-customer-880k.onrender.com";
const AI_SEARCH_SERVICE_URL = process.env.AI_SEARCH_SERVICE_URL ||
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
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        // allow subdomains of allowed origins (useful for vercel preview domains)
        const matched = allowedOrigins.some((o) => {
            try {
                const parsed = new URL(o);
                return origin.endsWith(parsed.host);
            }
            catch (e) {
                return false;
            }
        });
        if (matched)
            return callback(null, true);
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
    },
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: ["set-cookie", "Set-Cookie"],
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ limit: "100mb", extended: true }));
app.use((0, cookie_parser_1.default)());
app.set("trust proxy", 1);
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: (req) => (req.user ? 1000 : 100), // Limit each IP to 100 requests per windowMs for unauthenticated users, 1000 for authenticated users
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
const apiRouter = express_1.default.Router();
// Specific routes first (before wildcard)
apiRouter.use("/auth", (0, express_http_proxy_1.default)(AUTH_SERVICE_URL, {
    https: true,
    proxyReqPathResolver: (req) => `/api/auth${req.url}`, // Map /api/auth/* to auth service /api/auth/*
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
})); // Auth Service
// Direct login endpoints (backward compatibility)
apiRouter.use("/login-user", (0, express_http_proxy_1.default)(AUTH_SERVICE_URL, {
    https: true,
    proxyReqPathResolver: (req) => `/api/login-user${req.url}`,
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
}));
apiRouter.use("/login-seller", (0, express_http_proxy_1.default)(AUTH_SERVICE_URL, {
    https: true,
    proxyReqPathResolver: (req) => `/api/login-seller${req.url}`,
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
}));
apiRouter.use("/register-user", (0, express_http_proxy_1.default)(AUTH_SERVICE_URL, {
    https: true,
    proxyReqPathResolver: (req) => `/api/register-user${req.url}`,
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
}));
apiRouter.use("/register-seller", (0, express_http_proxy_1.default)(AUTH_SERVICE_URL, {
    https: true,
    proxyReqPathResolver: (req) => `/api/register-seller${req.url}`,
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
}));
apiRouter.use("/seller-shop", (0, express_http_proxy_1.default)(AUTH_SERVICE_URL, {
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
})); // Seller Shop (Auth Service)
apiRouter.use("/catalogue", (0, express_http_proxy_1.default)(CATALOGUE_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        // Map /api/catalogue/* to /products/*
        const path = req.url;
        const targetPath = path.startsWith("/products")
            ? path
            : `/products${path}`;
        console.log(`[Catalogue Proxy] ${req.method} /api/catalogue${path} -> ${targetPath}`);
        return targetPath;
    },
})); // Catalogue Service
apiRouter.use("/notifications", (0, express_http_proxy_1.default)(NOTIFICATION_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/notifications${req.url}`, // Preserve full path
})); // Notification Service
apiRouter.use("/payments", (0, express_http_proxy_1.default)(PAYMENT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/payments${req.url}`, // Preserve full path
})); // Payment Service
apiRouter.use("/reviews", (0, express_http_proxy_1.default)(REVIEW_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/reviews${req.url}`, // Preserve full path
})); // Review Service
apiRouter.use("/inventory", (0, express_http_proxy_1.default)(INVENTORY_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/inventory${req.url}`, // Preserve full path
})); // Inventory Service
apiRouter.use("/messages", (0, express_http_proxy_1.default)(MESSAGING_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/messages${req.url}`, // Preserve full path
})); // Messaging Service
apiRouter.use("/cart", (0, express_http_proxy_1.default)(CHECKOUT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/cart${req.url}`, // Preserve full path
})); // Checkout Service
apiRouter.use("/wishlist", (0, express_http_proxy_1.default)(CHECKOUT_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/wishlist${req.url}`, // Preserve full path
})); // Checkout Service - Wishlist
apiRouter.use("/orders", (0, express_http_proxy_1.default)(ORDER_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/orders${req.url}`, // Preserve full path
})); // Order Service
apiRouter.use("/profiles", (0, express_http_proxy_1.default)(CUSTOMER_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/profiles${req.url}`, // Map to customer service
})); // Customer Service
apiRouter.use("/ai-search", (0, express_http_proxy_1.default)(AI_SEARCH_SERVICE_URL, {
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
})); // AI Search Service
// Register the API router under /api prefix
app.use("/api", apiRouter);
// For backward compatibility, also mount routes at the root level
app.use("/", apiRouter);
// Global error handler for proxy errors
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    if (err.code === "ECONNREFUSED") {
        return res.status(503).json({
            error: "Service Unavailable",
            message: "Cannot connect to the backend service. It may be starting up or temporarily unavailable. Please try again in a moment.",
            code: err.code,
        });
    }
    if (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT") {
        return res.status(504).json({
            error: "Gateway Timeout",
            message: "The backend service took too long to respond. Please try again.",
            code: err.code,
        });
    }
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message || "An unexpected error occurred",
    });
});
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 API GATEWAY STARTED`);
    console.log(`${"=".repeat(60)}`);
    console.log(`📍 Listening at: http://localhost:${port}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`\n📡 CONFIGURED MICROSERVICES:`);
    console.log(`${"─".repeat(60)}`);
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
    console.log(`${"=".repeat(60)}\n`);
});
server.on("error", console.error);
