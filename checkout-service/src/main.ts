import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import checkoutRouter from "./routes/checkout.router";
import wishlistRouter from "./routes/wishlist.router";

const app: Application = express();
const PORT = process.env['CHECKOUT_SERVICE_PORT'] || 6008;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "checkout-service",
    port: PORT,
  });
});

// Routes
app.use("/cart", checkoutRouter);
app.use("/wishlist", wishlistRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🛒 Checkout Service listening at http://localhost:${PORT}`);
  console.log(
    `💳 Payment Service URL: ${
      process.env['PAYMENT_SERVICE_URL'] || "http://localhost:6004"
    }`
  );
});

export default app;
