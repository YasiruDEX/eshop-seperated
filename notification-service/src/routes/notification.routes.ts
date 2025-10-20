import express, { Router } from "express";
import {
  sendOrderConfirmationEmail,
  sendWishlistEmail,
} from "../controllers/notification.controller";

const router: Router = express.Router();

/**
 * @route   POST /notifications/order-confirmation
 * @desc    Send order confirmation email
 * @body    { email: string, orderNumber: string }
 * @access  Public
 */
router.post("/order-confirmation", sendOrderConfirmationEmail);

/**
 * @route   POST /notifications/wishlist
 * @desc    Send wishlist notification email
 * @body    { email: string, itemName: string }
 * @access  Public
 */
router.post("/wishlist", sendWishlistEmail);

export default router;
