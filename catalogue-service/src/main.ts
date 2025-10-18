/**
 * Catalogue Service - Manages scraped product data
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { catalogueRouter } from "./routes/catalogue.router";

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
    message: "Catalogue service is running",
    service: "catalogue-service",
    port: 6002,
  });
});

// Catalogue routes
app.use("/products", catalogueRouter);

const port = process.env["CATALOGUE_PORT"] || 6002;
const server = app.listen(port, () => {
  console.log(`🚀 Catalogue Service listening at http://localhost:${port}`);
});

server.on("error", console.error);
