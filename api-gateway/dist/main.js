/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("express-http-proxy");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("morgan");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const cors_1 = tslib_1.__importDefault(__webpack_require__(3));
const express_http_proxy_1 = tslib_1.__importDefault(__webpack_require__(4));
const morgan_1 = tslib_1.__importDefault(__webpack_require__(5));
const express_rate_limit_1 = tslib_1.__importDefault(__webpack_require__(6));
const cookie_parser_1 = tslib_1.__importDefault(__webpack_require__(7));
const app = (0, express_1.default)();
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
// Specific routes first (before /api wildcard)
app.use("/auth", (0, express_http_proxy_1.default)("http://localhost:6001", {
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
})); // Backwards compatibility
app.use("/catalogue", (0, express_http_proxy_1.default)("http://localhost:6002", {
    proxyReqPathResolver: (req) => {
        // Map /catalogue/* to /products/*
        // But if the path already starts with /products, don't add it again
        const path = req.url;
        const targetPath = path.startsWith("/products")
            ? path
            : `/products${path}`;
        console.log(`[Catalogue Proxy] ${req.method} /catalogue${path} -> ${targetPath}`);
        return targetPath;
    },
})); // Catalogue Service
app.use("/notifications", (0, express_http_proxy_1.default)("http://localhost:6003", {
    proxyReqPathResolver: (req) => `/notifications${req.url}`, // Preserve full path
})); // Notification Service
app.use("/payments", (0, express_http_proxy_1.default)("http://localhost:6004", {
    proxyReqPathResolver: (req) => `/payments${req.url}`, // Preserve full path
})); // Payment Service
app.use("/reviews", (0, express_http_proxy_1.default)("http://localhost:6005", {
    proxyReqPathResolver: (req) => `/reviews${req.url}`, // Preserve full path
})); // Review Service
app.use("/inventory", (0, express_http_proxy_1.default)("http://localhost:6010", {
    proxyReqPathResolver: (req) => `/inventory${req.url}`, // Preserve full path
})); // Inventory Service
app.use("/messages", (0, express_http_proxy_1.default)("http://localhost:6007", {
    proxyReqPathResolver: (req) => `/messages${req.url}`, // Preserve full path
})); // Messaging Service
app.use("/cart", (0, express_http_proxy_1.default)("http://localhost:6008", {
    proxyReqPathResolver: (req) => `/cart${req.url}`, // Preserve full path
})); // Checkout Service
app.use("/wishlist", (0, express_http_proxy_1.default)("http://localhost:6008", {
    proxyReqPathResolver: (req) => `/wishlist${req.url}`, // Preserve full path
})); // Checkout Service - Wishlist
app.use("/orders", (0, express_http_proxy_1.default)("http://localhost:6009", {
    proxyReqPathResolver: (req) => `/orders${req.url}`, // Preserve full path
})); // Order Service
app.use("/profiles", (0, express_http_proxy_1.default)("http://localhost:6006", {
    proxyReqPathResolver: (req) => `/api/profiles${req.url}`, // Map to customer service
})); // Customer Service
app.use("/ai-search", (0, express_http_proxy_1.default)("https://0f195hsk-3004.inc1.devtunnels.ms/", {
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
})); // AI Search Service
// Route all /api/* requests to auth service
app.use("/api", (req, res, next) => {
    const proxyServer = (0, express_http_proxy_1.default)("http://localhost:6001", {
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

})();

/******/ })()
;