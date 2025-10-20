"use strict";
/**
 * Notification Service - Handles email notifications
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const email_service_1 = require("./services/email.service");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
    ],
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        message: "Notification service is running",
        service: "notification-service",
        port: 6003,
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
        },
    });
});
// Notification routes
app.use("/notifications", notification_routes_1.default);
const port = process.env.NOTIFICATION_PORT || 6003;
const server = app.listen(port, async () => {
    console.log(`📧 Notification Service listening at http://localhost:${port}`);
    console.log(`📮 SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`📮 SMTP User: ${process.env.SMTP_USER}`);
    // Verify SMTP connection on startup
    console.log("🔍 Verifying SMTP connection...");
    const isConnected = await (0, email_service_1.verifyEmailConnection)();
    if (isConnected) {
        console.log("✅ SMTP connection verified successfully");
    }
    else {
        console.log("⚠️  SMTP connection verification failed - check your credentials");
    }
});
server.on("error", console.error);
