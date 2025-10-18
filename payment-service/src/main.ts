import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import paymentRoutes from "./routes/payment.routes";

const app: Application = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 6004;

// Middleware
app.use(cors());
app.use(morgan("dev"));

// Stripe webhook needs raw body, so we'll handle it specially in the route
app.use("/payments/webhook", express.raw({ type: "application/json" }));

// Regular JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "payment-service",
    port: PORT,
  });
});

// Routes
app.use("/payments", paymentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`💳 Payment Service listening at http://localhost:${PORT}`);
  console.log(
    `💰 Stripe API Key: ${
      process.env.STRIPE_API_KEY ? "✓ Configured" : "✗ Not configured"
    }`
  );
});

export default app;
