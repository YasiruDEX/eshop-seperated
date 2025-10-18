import { Request, Response, NextFunction } from "express";
import {
  createPaymentSession,
  handleWebhook,
  getOrderPaymentStatus,
  verifyPaymentSession,
} from "../services/payment.service";
import { PrismaClient } from "../../../../generated/prisma-payment";

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      orderId,
      amount,
      currency,
      customerEmail,
      customerName,
      sellerId,
      metadata,
    } = req.body;

    // Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const result = await createPaymentSession({
      orderId,
      amount,
      currency,
      customerEmail,
      customerName,
      sellerId,
      metadata,
    });

    res.status(200).json({
      success: true,
      message: "Payment session created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment session",
      error: error.message,
    });
  }
};

export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Missing stripe-signature header",
      });
    }

    const payload = req.body;

    await handleWebhook(signature, payload);

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(400).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await getOrderPaymentStatus(orderId);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Error getting payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment status",
      error: error.message,
    });
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

    const result = await verifyPaymentSession(sessionId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { status, paidAt } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const prisma = new PrismaClient();

    const updateData: any = { status };
    if (paidAt) {
      updateData.paidAt = new Date(paidAt);
    }

    const order = await prisma.orders.update({
      where: { orderId },
      data: updateData,
    });

    await prisma.$disconnect();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
