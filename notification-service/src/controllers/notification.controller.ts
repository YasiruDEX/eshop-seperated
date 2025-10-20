import { Request, Response } from "express";
import {
  sendOrderConfirmation,
  sendWishlistNotification,
} from "../services/email.service";

/**
 * Send Order Confirmation Email
 * @route POST /notifications/order-confirmation
 * @body { email: string, orderNumber: string }
 */
export const sendOrderConfirmationEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, orderNumber } = req.body;

    // Validation
    if (!email || !orderNumber) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "Email and orderNumber are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    console.log(`📨 Processing order confirmation request for ${email}`);

    // Send email
    const result = await sendOrderConfirmation(email, orderNumber);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          email,
          orderNumber,
          type: "order-confirmation",
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Failed to send email",
        message: result.message,
      });
    }
  } catch (error) {
    console.error("❌ Error in sendOrderConfirmationEmail:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Send Wishlist Notification Email
 * @route POST /notifications/wishlist
 * @body { email: string, itemName: string }
 */
export const sendWishlistEmail = async (req: Request, res: Response) => {
  try {
    const { email, itemName } = req.body;

    // Validation
    if (!email || !itemName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "Email and itemName are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    console.log(`📨 Processing wishlist notification request for ${email}`);

    // Send email
    const result = await sendWishlistNotification(email, itemName);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          email,
          itemName,
          type: "wishlist",
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Failed to send email",
        message: result.message,
      });
    }
  } catch (error) {
    console.error("❌ Error in sendWishlistEmail:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
