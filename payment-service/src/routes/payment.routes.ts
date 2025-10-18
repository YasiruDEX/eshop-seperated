import express, { Router } from "express";
import {
  createPayment,
  handleStripeWebhook,
  getPaymentStatus,
  verifyPayment,
  updateOrderStatus,
} from "../controllers/payment.controller";

const router: Router = express.Router();

// Create payment session
router.post("/create-session", createPayment);

// Stripe webhook (needs raw body, handled in main.ts)
router.post("/webhook", handleStripeWebhook);

// Get payment status by orderId
router.get("/status/:orderId", getPaymentStatus);

// Verify payment by sessionId
router.get("/verify", verifyPayment);

// Update order status
router.patch("/order/:orderId/status", updateOrderStatus);

export default router;
