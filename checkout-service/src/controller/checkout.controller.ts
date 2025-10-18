import { Request, Response } from "express";
import { PrismaClient } from "../../../../generated/prisma-checkout";
import axios from "axios";

const prisma = new PrismaClient();

/**
 * Add item to cart
 * POST /cart
 * Body: { userId, itemId, price, quantity }
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId, itemId, price, quantity } = req.body;

    // Validation
    if (!userId || !itemId || !price || !quantity) {
      return res.status(400).json({
        success: false,
        message: "userId, itemId, price, and quantity are required",
      });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    // Check if item already exists in cart for this user
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId,
        itemId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity if item exists
      cartItem = await prisma.cart.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
          price, // Update price in case it changed
        },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cart.create({
        data: {
          userId,
          itemId,
          price,
          quantity,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: existingCartItem
        ? "Cart item updated successfully"
        : "Item added to cart successfully",
      data: cartItem,
    });
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

/**
 * Get user's cart
 * GET /cart/:userId
 */
export const getUserCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const cartItems = await prisma.cart.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        items: cartItems,
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        total: total,
      },
    });
  } catch (error: any) {
    console.error("Error getting cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart",
      error: error.message,
    });
  }
};

/**
 * Update cart item quantity
 * PATCH /cart/:id
 * Body: { quantity }
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }

    if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const updatedItem = await prisma.cart.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: updatedItem,
    });
  } catch (error: any) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

/**
 * Remove item from cart
 * DELETE /cart/:id
 */
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }

    await prisma.cart.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error: any) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

/**
 * Clear user's cart
 * DELETE /cart/user/:userId
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const result = await prisma.cart.deleteMany({
      where: {
        userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

/**
 * Checkout - Process payment for user's cart
 * POST /checkout/:userId
 * Body: { customerEmail, customerName } (optional)
 */
export const checkout = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { customerEmail, customerName, currency = "usd" } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Get user's cart
    const cartItems = await prisma.cart.findMany({
      where: {
        userId,
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Generate order ID with full userId (MongoDB ObjectId is 24 characters)
    const orderId = `order_${Date.now()}_${userId}`;

    // Prepare metadata with cart items
    const metadata = {
      userId,
      items: JSON.stringify(
        cartItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
        }))
      ),
      itemCount: cartItems.length.toString(),
    };

    // Get payment service URL from environment or use default
    const paymentServiceUrl =
      process.env["PAYMENT_SERVICE_URL"] || "http://localhost:6004";

    // Call payment service to create Stripe payment session
    const paymentResponse = await axios.post(
      `${paymentServiceUrl}/payments/create-session`,
      {
        orderId,
        amount: totalAmount,
        currency,
        customerEmail,
        customerName,
        metadata,
      }
    );

    if (!paymentResponse.data.success) {
      throw new Error("Payment session creation failed");
    }

    const paymentData = paymentResponse.data.data;

    // Optionally clear the cart after successful payment session creation
    // Uncomment if you want to clear cart immediately
    // await prisma.cart.deleteMany({
    //   where: { userId },
    // });

    res.status(200).json({
      success: true,
      message: "Checkout initiated successfully",
      data: {
        orderId,
        sessionId: paymentData.sessionId,
        sessionUrl: paymentData.sessionUrl,
        totalAmount,
        currency,
        itemCount: cartItems.length,
        items: cartItems,
      },
    });
  } catch (error: any) {
    console.error("Error during checkout:", error);
    res.status(500).json({
      success: false,
      message: "Checkout failed",
      error: error.message,
      details: error.response?.data || null,
    });
  }
};

/**
 * Get cart item by ID
 * GET /cart/item/:id
 */
export const getCartItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }

    const cartItem = await prisma.cart.findUnique({
      where: {
        id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: cartItem,
    });
  } catch (error: any) {
    console.error("Error getting cart item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart item",
      error: error.message,
    });
  }
};

/**
 * Handle payment success - Update order status and clear cart
 * POST /payment-success
 * Body: { sessionId, orderId, customerEmail }
 */
export const handlePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { sessionId, orderId, customerEmail } = req.body;

    if (!sessionId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "sessionId and orderId are required",
      });
    }

    // Extract userId from orderId (format: order_timestamp_userId)
    // MongoDB ObjectId is 24 hex characters
    const userIdMatch = orderId.match(/_([a-f0-9]{24})$/i);
    if (!userIdMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId format",
      });
    }
    const userId = userIdMatch[1];

    // Get cart items before clearing (for email notification)
    const cartItems = await prisma.cart.findMany({
      where: { userId },
    });

    if (cartItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart already cleared",
        data: {
          orderId,
          status: "paid",
          itemsCleared: 0,
        },
      });
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Update payment database order status to "paid"
    const paymentServiceUrl =
      process.env["PAYMENT_SERVICE_URL"] || "http://localhost:6004";

    try {
      await axios.patch(
        `${paymentServiceUrl}/payments/order/${orderId}/status`,
        {
          status: "paid",
          paidAt: new Date().toISOString(),
        }
      );
      console.log(`Payment order ${orderId} marked as paid`);
    } catch (paymentError: any) {
      console.error("Failed to update payment status:", paymentError.message);
      // Continue even if payment update fails
    }

    // Create orders via order service (grouped by shop/website)
    const orderServiceUrl =
      process.env["ORDER_SERVICE_URL"] || "http://localhost:6009";

    let ordersCreated = false;
    let orderCount = 0;
    try {
      console.log("Creating orders with data:", {
        userId,
        paymentId: sessionId,
        customerEmail: customerEmail || "N/A",
        cartItemsCount: cartItems.length,
      });

      const orderResponse = await axios.post(
        `${orderServiceUrl}/orders/create`,
        {
          userId,
          paymentId: sessionId,
          customerEmail: customerEmail || undefined,
          customerName: customerEmail ? "Customer" : undefined,
          cartItems: cartItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
          })),
        }
      );

      if (orderResponse.data.success) {
        ordersCreated = true;
        orderCount = orderResponse.data.data.orderCount;
        console.log(`Created ${orderCount} order(s) for user ${userId}`);
      }
    } catch (orderError: any) {
      console.error("Failed to create orders:", {
        message: orderError.message,
        response: orderError.response?.data,
        status: orderError.response?.status,
      });
      // Continue even if order creation fails
    }

    // Clear the user's cart
    const deleteResult = await prisma.cart.deleteMany({
      where: { userId },
    });

    // Get notification service URL
    const notificationServiceUrl =
      process.env["NOTIFICATION_SERVICE_URL"] || "http://localhost:6003";

    // Send order confirmation email (non-blocking)
    if (customerEmail) {
      try {
        await axios.post(`${notificationServiceUrl}/send-mail`, {
          to: customerEmail,
          subject: "Order Confirmation - TitanStore",
          text: `Thank you for your order!\n\nOrder ID: ${orderId}\nTotal Amount: LKR ${totalAmount.toFixed(
            2
          )}\nItems: ${
            cartItems.length
          }\n\nYour order has been confirmed and is being processed.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #000; border-bottom: 4px solid #000; padding-bottom: 10px;">Order Confirmed!</h1>
              <p style="font-size: 16px;">Thank you for your purchase at TitanStore.</p>
              
              <div style="background: #f5f5f5; border: 2px solid #000; padding: 20px; margin: 20px 0;">
                <h2 style="margin-top: 0;">Order Details</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Status:</strong> <span style="color: green;">PAID</span></p>
                <p><strong>Total Amount:</strong> LKR ${totalAmount.toFixed(
                  2
                )}</p>
                <p><strong>Number of Items:</strong> ${cartItems.length}</p>
              </div>
              
              <p>Your order is being processed and you will receive another email when it ships.</p>
              <p style="margin-top: 30px;">Thank you for shopping with us!</p>
              <p style="color: #666; font-size: 14px;">- TitanStore Team</p>
            </div>
          `,
        });
        console.log(`Order confirmation email sent for order ${orderId}`);
      } catch (emailError: any) {
        console.error("Failed to send confirmation email:", emailError.message);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: {
        orderId,
        status: "paid",
        itemsCleared: deleteResult.count,
        totalAmount,
        emailSent: !!customerEmail,
        ordersCreated,
        orderCount,
      },
    });
  } catch (error: any) {
    console.error("Error handling payment success:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment success",
      error: error.message,
    });
  }
};
