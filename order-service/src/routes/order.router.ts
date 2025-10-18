import express, { Router } from "express";
import {
  createOrdersFromCart,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getShopOrders,
  getShopOrdersByName,
} from "../controller/order.controller";

const router: Router = express.Router();

// Create orders from cart
router.post("/create", createOrdersFromCart);

// Get user orders (more specific route first)
router.get("/user/:userId", getUserOrders);

// Get shop orders by shop name (more specific route - must come before /:orderId)
router.get("/shop-name/:shopName", getShopOrdersByName);

// Get shop orders by shop ID (more specific route - must come before /:orderId)
router.get("/shop/:shopId", getShopOrders);

// Update order status (more specific route - must come before /:orderId)
router.patch("/:orderId/status", updateOrderStatus);

// Get order by ID (generic route - must come last)
router.get("/:orderId", getOrderById);

export default router;
