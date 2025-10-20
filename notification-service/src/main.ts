/**
 * Notification Service - Handles email notifications
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import notificationRoutes from "./routes/notification.routes";
import { verifyEmailConnection } from "./services/email.service";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8080",
    ],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use("/notifications", notificationRoutes);

const port = process.env.NOTIFICATION_PORT || 6003;
const server = app.listen(port, async () => {
  console.log(`📧 Notification Service listening at http://localhost:${port}`);
  console.log(`📮 SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`📮 SMTP User: ${process.env.SMTP_USER}`);

  // Verify SMTP connection on startup
  console.log("🔍 Verifying SMTP connection...");
  const isConnected = await verifyEmailConnection();
  if (isConnected) {
    console.log("✅ SMTP connection verified successfully");
  } else {
    console.log(
      "⚠️  SMTP connection verification failed - check your credentials"
    );
  }
});

server.on("error", console.error);
