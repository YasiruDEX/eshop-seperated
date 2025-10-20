import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import reviewRoutes from "./routes/review.routes";

const app: Application = express();
const PORT = process.env.REVIEW_SERVICE_PORT || 6005;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "review-service",
    port: PORT,
  });
});

// Routes
app.use("/reviews", reviewRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`⭐ Review Service listening at http://localhost:${PORT}`);
  console.log(
    `📊 Reviews Database: ${
      process.env.REVIEWS_DATABASE_URL ? "✓ Configured" : "✗ Not configured"
    }`
  );
});

export default app;
