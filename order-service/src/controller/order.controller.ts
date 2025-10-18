import { Request, Response } from "express";
import { PrismaClient } from "../../../../generated/prisma-order";
import axios from "axios";

const prisma = new PrismaClient();

interface CartItem {
  itemId: string;
  quantity: number;
  price: number;
  shopId?: string;
  shopName?: string;
  productName?: string;
}

interface OrderItemData {
  itemId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

/**
 * Create orders from cart items grouped by shop
 * POST /orders/create
 * Body: { userId, paymentId, customerEmail, customerName, cartItems }
 */
export const createOrdersFromCart = async (req: Request, res: Response) => {
  try {
    const { userId, paymentId, customerEmail, customerName, cartItems } =
      req.body;

    console.log("Order creation request received:", {
      userId,
      paymentId,
      customerEmail,
      customerName,
      cartItemsCount: cartItems?.length,
    });

    if (!userId || !paymentId || !cartItems || !Array.isArray(cartItems)) {
      console.error("Missing required fields:", {
        hasUserId: !!userId,
        hasPaymentId: !!paymentId,
        hasCartItems: !!cartItems,
        isArray: Array.isArray(cartItems),
      });
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId, paymentId, and cartItems are required",
      });
    }

    // Get catalogue service URL
    const catalogueServiceUrl =
      process.env.CATALOGUE_SERVICE_URL || "http://localhost:6002";

    // Fetch product details for all items
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item: CartItem) => {
        try {
          const response = await axios.get(
            `${catalogueServiceUrl}/products/${item.itemId}`
          );
          const product = response.data.data;

          // Extract shop info from website or use default
          const shopName =
            product.website || product.source_domain || "TitanStore";
          const shopId = product.website
            ? product.website.toLowerCase().replace(/[^a-z0-9]/g, "-")
            : "titanstore";

          return {
            ...item,
            productName: product.title || "Unknown Product",
            shopId,
            shopName,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.itemId}:`, error);
          return {
            ...item,
            productName: "Unknown Product",
            shopId: "titanstore",
            shopName: "TitanStore",
          };
        }
      })
    );

    // Group items by shop
    const itemsByShop = itemsWithDetails.reduce((acc: any, item) => {
      const shopId = item.shopId || "default-shop";
      if (!acc[shopId]) {
        acc[shopId] = {
          shopId,
          shopName: item.shopName || "TitanStore",
          items: [],
        };
      }
      acc[shopId].items.push(item);
      return acc;
    }, {});

    // Create orders for each shop
    const createdOrders = [];
    for (const shopId in itemsByShop) {
      const shop = itemsByShop[shopId];

      // Calculate total for this shop
      const totalAmount = shop.items.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );

      // Generate unique order ID
      const orderId = `order_${Date.now()}_${userId}_${shopId}`;

      // Prepare order items
      const orderItems: OrderItemData[] = shop.items.map((item: CartItem) => ({
        itemId: item.itemId,
        productName: item.productName || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
      }));

      // Create order
      const order = await prisma.order.create({
        data: {
          orderId,
          userId,
          shopId: shop.shopId,
          shopName: shop.shopName,
          items: orderItems,
          totalAmount,
          currency: "lkr",
          confirmed: false,
          deliveryStatus: "preparing",
          paymentId,
          paymentStatus: "paid",
          customerEmail: customerEmail || "customer@example.com",
          customerName: customerName || "Customer",
        },
      });

      createdOrders.push(order);
    }

    res.status(201).json({
      success: true,
      message: `${createdOrders.length} order(s) created successfully`,
      data: {
        orders: createdOrders,
        orderCount: createdOrders.length,
      },
    });
  } catch (error: any) {
    console.error("Error creating orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create orders",
      error: error.message,
    });
  }
};

/**
 * Get all orders for a user
 * GET /orders/user/:userId
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalOrders: orders.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/**
 * Get order by ID
 * GET /orders/:orderId
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * Update order status
 * PATCH /orders/:orderId/status
 * Body: { confirmed?, deliveryStatus? }
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { confirmed, deliveryStatus } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const updateData: any = {};
    if (confirmed !== undefined) updateData.confirmed = confirmed;
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;

    const order = await prisma.order.update({
      where: { orderId },
      data: updateData,
    });

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

/**
 * Get orders by shop
 * GET /orders/shop/:shopId
 */
export const getShopOrders = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    const orders = await prisma.order.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalOrders: orders.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching shop orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shop orders",
      error: error.message,
    });
  }
};

/**
 * Get orders by shop name
 * GET /orders/shop-name/:shopName
 */
export const getShopOrdersByName = async (req: Request, res: Response) => {
  try {
    const { shopName } = req.params;

    if (!shopName) {
      return res.status(400).json({
        success: false,
        message: "shopName is required",
      });
    }

    // Decode URL-encoded shop name
    const decodedShopName = decodeURIComponent(shopName);

    const orders = await prisma.order.findMany({
      where: { shopName: decodedShopName },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: {
        orders,
        totalOrders: orders.length,
        shopName: decodedShopName,
      },
    });
  } catch (error: any) {
    console.error("Error fetching shop orders by name:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shop orders",
      error: error.message,
    });
  }
};
