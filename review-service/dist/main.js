"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const app = (0, express_1.default)();
const PORT = process.env.REVIEW_SERVICE_PORT || 6005;
// Middleware
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "review-service",
        port: PORT,
    });
});
// Routes
app.use("/reviews", review_routes_1.default);
// Start server
app.listen(PORT, () => {
    console.log(`⭐ Review Service listening at http://localhost:${PORT}`);
    console.log(`📊 Reviews Database: ${process.env.REVIEWS_DATABASE_URL ? "✓ Configured" : "✗ Not configured"}`);
});
exports.default = app;
