import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Add a new inventory item
 * @route POST /inventory
 */
export const addInventoryItem = async (req: Request, res: Response) => {
  try {
    const { userId, itemId, itemName, count, unit } = req.body;

    // Validation
    if (!userId || !itemName || count === undefined || !unit) {
      return res.status(400).json({
        success: false,
        error: "userId, itemName, count, and unit are required fields",
      });
    }

    if (typeof count !== "number" || count < 0) {
      return res.status(400).json({
        success: false,
        error: "count must be a non-negative number",
      });
    }

    console.log("➕ Adding new inventory item:", {
      userId,
      itemName,
      count,
      unit,
    });

    const newItem = await prisma.inventoryItems.create({
      data: {
        userId,
        itemId: itemId || null,
        itemName,
        count,
        unit,
      },
    });

    console.log("✅ Item added successfully:", newItem.id);

    return res.status(201).json({
      success: true,
      message: "Inventory item added successfully",
      data: newItem,
    });
  } catch (error) {
    console.error("❌ Error adding inventory item:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all inventory items for a user
 * @route GET /inventory/:userId
 */
export const getUserInventory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    console.log(`🔍 Fetching inventory for user: ${userId}`);

    const items = await prisma.inventoryItems.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    console.log(`📦 Found ${items.length} items for user ${userId}`);

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("❌ Error fetching user inventory:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all inventory items (admin/debugging)
 * @route GET /inventory
 */
export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    console.log("🔍 Fetching all inventory items");

    const items = await prisma.inventoryItems.findMany({
      orderBy: { createdAt: "desc" },
    });

    console.log(`📦 Found ${items.length} total items`);

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("❌ Error fetching all inventory items:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get a specific inventory item by ID
 * @route GET /inventory/item/:id
 */
export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid item ID format. Must be a valid MongoDB ObjectId.",
      });
    }

    console.log(`🔍 Fetching item with ID: ${id}`);

    const item = await prisma.inventoryItems.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Inventory item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("❌ Error fetching inventory item:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update an inventory item
 * @route PUT /inventory/:id
 */
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { itemName, count, unit, itemId } = req.body;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid item ID format. Must be a valid MongoDB ObjectId.",
      });
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (itemName !== undefined) updateData.itemName = itemName;
    if (count !== undefined) {
      if (typeof count !== "number" || count < 0) {
        return res.status(400).json({
          success: false,
          error: "count must be a non-negative number",
        });
      }
      updateData.count = count;
    }
    if (unit !== undefined) updateData.unit = unit;
    if (itemId !== undefined) updateData.itemId = itemId;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields provided for update",
      });
    }

    console.log(`📝 Updating item ${id} with:`, updateData);

    const updatedItem = await prisma.inventoryItems.update({
      where: { id },
      data: updateData,
    });

    console.log("✅ Item updated successfully");

    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    if ((error as any).code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Inventory item not found",
      });
    }
    console.error("❌ Error updating inventory item:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete an inventory item by ID
 * @route DELETE /inventory/:id
 */
export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid item ID format. Must be a valid MongoDB ObjectId.",
      });
    }

    console.log(`🗑️  Deleting item with ID: ${id}`);

    await prisma.inventoryItems.delete({
      where: { id },
    });

    console.log("✅ Item deleted successfully");

    return res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    if ((error as any).code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Inventory item not found",
      });
    }
    console.error("❌ Error deleting inventory item:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update inventory item count (increment/decrement)
 * @route PATCH /inventory/:id/count
 */
export const updateItemCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { count } = req.body;

    // Validate ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid item ID format. Must be a valid MongoDB ObjectId.",
      });
    }

    if (count === undefined || typeof count !== "number" || count < 0) {
      return res.status(400).json({
        success: false,
        error: "count must be a non-negative number",
      });
    }

    console.log(`🔢 Updating count for item ${id} to ${count}`);

    const updatedItem = await prisma.inventoryItems.update({
      where: { id },
      data: { count },
    });

    console.log("✅ Count updated successfully");

    return res.status(200).json({
      success: true,
      message: "Item count updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    if ((error as any).code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Inventory item not found",
      });
    }
    console.error("❌ Error updating item count:", error);
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
