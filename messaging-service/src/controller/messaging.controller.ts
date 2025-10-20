import { Request, Response } from "express";
import { PrismaClient } from "../../../../generated/prisma-messaging";

const prisma = new PrismaClient();

/**
 * Send a new message
 * @route POST /messages
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { userId, sellerId, senderId, senderType, message } = req.body;

    // Validation
    if (!userId || !sellerId || !senderId || !senderType || !message) {
      return res.status(400).json({
        success: false,
        error:
          "userId, sellerId, senderId, senderType, and message are required fields",
      });
    }

    if (senderType !== "user" && senderType !== "seller") {
      return res.status(400).json({
        success: false,
        error: "senderType must be either 'user' or 'seller'",
      });
    }

    // Validate that senderId matches either userId or sellerId
    if (senderType === "user" && senderId !== userId) {
      return res.status(400).json({
        success: false,
        error: "senderId must match userId when senderType is 'user'",
      });
    }

    if (senderType === "seller" && senderId !== sellerId) {
      return res.status(400).json({
        success: false,
        error: "senderId must match sellerId when senderType is 'seller'",
      });
    }

    console.log("💬 Sending new message:", {
      userId,
      sellerId,
      senderId,
      senderType,
    });

    const newMessage = await prisma.messaging.create({
      data: {
        userId,
        sellerId,
        senderId,
        senderType,
        message,
      },
    });

    console.log("✅ Message sent successfully:", newMessage.id);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all messages between a user and seller
 * @route GET /messages/conversation/:userId/:sellerId
 */
export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId, sellerId } = req.params;

    if (!userId || !sellerId) {
      return res.status(400).json({
        success: false,
        error: "userId and sellerId are required",
      });
    }

    console.log(
      `💬 Fetching conversation between user ${userId} and seller ${sellerId}`
    );

    const messages = await prisma.messaging.findMany({
      where: {
        userId,
        sellerId,
      },
      orderBy: {
        createdAt: "asc", // Order by oldest first for chat display
      },
    });

    console.log(`📦 Found ${messages.length} messages in conversation`);

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("❌ Error fetching conversation:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all conversations for a user
 * @route GET /messages/user/:userId
 */
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    console.log(`💬 Fetching all conversations for user ${userId}`);

    const messages = await prisma.messaging.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by sellerId to get unique conversations
    const conversationMap = new Map();
    messages.forEach((msg) => {
      if (!conversationMap.has(msg.sellerId)) {
        conversationMap.set(msg.sellerId, {
          sellerId: msg.sellerId,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
      if (!msg.isRead && msg.senderType === "seller") {
        const conv = conversationMap.get(msg.sellerId);
        conv.unreadCount++;
      }
    });

    const conversations = Array.from(conversationMap.values());

    console.log(
      `📦 Found ${conversations.length} conversations for user ${userId}`
    );

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("❌ Error fetching user conversations:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all conversations for a seller
 * @route GET /messages/seller/:sellerId
 */
export const getSellerConversations = async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: "sellerId is required",
      });
    }

    console.log(`💬 Fetching all conversations for seller ${sellerId}`);

    const messages = await prisma.messaging.findMany({
      where: {
        sellerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by userId to get unique conversations
    const conversationMap = new Map();
    messages.forEach((msg) => {
      if (!conversationMap.has(msg.userId)) {
        conversationMap.set(msg.userId, {
          userId: msg.userId,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
      if (!msg.isRead && msg.senderType === "user") {
        const conv = conversationMap.get(msg.userId);
        conv.unreadCount++;
      }
    });

    const conversations = Array.from(conversationMap.values());

    console.log(
      `📦 Found ${conversations.length} conversations for seller ${sellerId}`
    );

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("❌ Error fetching seller conversations:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Mark messages as read
 * @route PATCH /messages/read
 */
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { userId, sellerId, readerId } = req.body;

    if (!userId || !sellerId || !readerId) {
      return res.status(400).json({
        success: false,
        error: "userId, sellerId, and readerId are required",
      });
    }

    console.log(`✅ Marking messages as read for reader ${readerId}`);

    // Mark messages as read where the reader is NOT the sender
    const result = await prisma.messaging.updateMany({
      where: {
        userId,
        sellerId,
        senderId: {
          not: readerId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    console.log(`✅ Marked ${result.count} messages as read`);

    return res.status(200).json({
      success: true,
      message: `Marked ${result.count} messages as read`,
      count: result.count,
    });
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a message by ID
 * @route DELETE /messages/:id
 */
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid message ID format. Must be a valid MongoDB ObjectId.",
      });
    }

    console.log(`🗑️  Deleting message with ID: ${id}`);

    await prisma.messaging.delete({
      where: { id },
    });

    console.log("✅ Message deleted successfully");

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    if ((error as any).code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }
    console.error("❌ Error deleting message:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get a specific message by ID
 * @route GET /messages/:id
 */
export const getMessageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid message ID format. Must be a valid MongoDB ObjectId.",
      });
    }

    console.log(`🔍 Fetching message with ID: ${id}`);

    const message = await prisma.messaging.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("❌ Error fetching message:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Cleanup Prisma connection on shutdown
 */
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
