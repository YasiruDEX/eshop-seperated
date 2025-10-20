/**
 * Messaging Service - Manages communication between users and sellers
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { messagingRouter } from "./routes/messaging.router";

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
    message: "Messaging service is running",
    service: "messaging-service",
    port: 6007,
  });
});

// Messaging routes
app.use("/messages", messagingRouter);

const port = process.env.MESSAGING_PORT || 6007;
const server = app.listen(port, () => {
  console.log(`💬 Messaging Service listening at http://localhost:${port}`);
});

server.on("error", console.error);
