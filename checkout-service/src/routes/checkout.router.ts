import express, { Router } from "express";
import {
  addToCart,
  getUserCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getCartItemById,
  handlePaymentSuccess,
} from "../controller/checkout.controller";

const router: Router = express.Router();

// Add item to cart
router.post("/", addToCart);

// Get user's cart
router.get("/:userId", getUserCart);

// Get cart item by ID
router.get("/item/:id", getCartItemById);

// Update cart item quantity
router.patch("/:id", updateCartItem);

// Remove item from cart
router.delete("/:id", removeFromCart);

// Clear user's cart
router.delete("/user/:userId", clearCart);

// Checkout - process payment
router.post("/checkout/:userId", checkout);

// Handle payment success (called by frontend after Stripe redirect)
router.post("/payment-success", handlePaymentSuccess);

export default router;
