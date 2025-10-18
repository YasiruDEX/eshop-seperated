import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import orderRouter from "./routes/order.router";

const app: Application = express();
const PORT = process.env.ORDER_SERVICE_PORT || 6009;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "order-service",
    port: PORT,
  });
});

// Routes
app.use("/orders", orderRouter);

// Start server
app.listen(PORT, () => {
  console.log(`📦 Order Service listening at http://localhost:${PORT}`);
});

export default app;
