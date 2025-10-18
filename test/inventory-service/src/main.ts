/**
 * Inventory Service - Manages user kitchen inventory
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { inventoryRouter } from "./routes/inventory.router";

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
    message: "Inventory service is running",
    service: "inventory-service",
    port: 6010,
  });
});

// Inventory routes
app.use("/inventory", inventoryRouter);

const port = process.env.INVENTORY_PORT || 6010;
const server = app.listen(port, () => {
  console.log(`📦 Inventory Service listening at http://localhost:${port}`);
});

server.on("error", console.error);
