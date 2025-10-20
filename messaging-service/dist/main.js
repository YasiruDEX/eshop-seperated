"use strict";
/**
 * Messaging Service - Manages communication between users and sellers
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const messaging_router_1 = require("./routes/messaging.router");
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
        message: "Messaging service is running",
        service: "messaging-service",
        port: 6007,
    });
});
// Messaging routes
app.use("/messages", messaging_router_1.messagingRouter);
const port = process.env.MESSAGING_PORT || 6007;
const server = app.listen(port, () => {
    console.log(`💬 Messaging Service listening at http://localhost:${port}`);
});
server.on("error", console.error);
