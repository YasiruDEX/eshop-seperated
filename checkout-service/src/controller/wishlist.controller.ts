import { Request, Response } from "express";
import { PrismaClient } from "../../../../generated/prisma-checkout";

const prisma = new PrismaClient();

/**
 * Add item to wishlist
 * POST /wishlist
 */
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        success: false,
        message: "userId and itemId are required",
      });
    }

    // Check if item already in wishlist
    const existingItem = await prisma.wishlist.findFirst({
      where: {
        userId,
        itemId,
      },
    });

    if (existingItem) {
      return res.status(200).json({
        success: true,
        message: "Item already in wishlist",
        data: existingItem,
      });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        itemId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Item added to wishlist",
      data: wishlistItem,
    });
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to wishlist",
      error: error.message,
    });
  }
};

/**
 * Remove item from wishlist
 * DELETE /wishlist/:id
 */
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedItem = await prisma.wishlist.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      data: deletedItem,
    });
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist",
      error: error.message,
    });
  }
};

/**
 * Remove item from wishlist by userId and itemId
 * DELETE /wishlist/user/:userId/item/:itemId
 */
export const removeFromWishlistByItem = async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.params;

    const deletedItem = await prisma.wishlist.deleteMany({
      where: {
        userId,
        itemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
      data: deletedItem,
    });
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist",
      error: error.message,
    });
  }
};

/**
 * Get user's wishlist
 * GET /wishlist/:userId
 */
export const getUserWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: wishlist,
      count: wishlist.length,
    });
  } catch (error: any) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get wishlist",
      error: error.message,
    });
  }
};

/**
 * Get wishlist count for user
 * GET /wishlist/:userId/count
 */
export const getWishlistCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const count = await prisma.wishlist.count({
      where: { userId },
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error("Error getting wishlist count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get wishlist count",
      error: error.message,
    });
  }
};

/**
 * Check if item is in wishlist
 * GET /wishlist/:userId/item/:itemId
 */
export const isItemInWishlist = async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.params;

    const item = await prisma.wishlist.findFirst({
      where: {
        userId,
        itemId,
      },
    });

    res.status(200).json({
      success: true,
      inWishlist: !!item,
      data: item,
    });
  } catch (error: any) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error.message,
    });
  }
};
