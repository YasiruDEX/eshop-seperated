import { Router } from "express";
import {
  addInventoryItem,
  getUserInventory,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  updateItemCount,
} from "../controller/inventory.controller";

const router = Router();

/**
 * @route   POST /inventory
 * @desc    Add a new inventory item
 * @body    { userId: string, itemId?: string, itemName: string, count: number, unit: string }
 * @access  Public
 */
router.post("/", addInventoryItem);

/**
 * @route   GET /inventory
 * @desc    Get all inventory items (admin/debugging)
 * @access  Public
 */
router.get("/", getAllInventoryItems);

/**
 * @route   GET /inventory/user/:userId
 * @desc    Get all inventory items for a specific user
 * @access  Public
 */
router.get("/user/:userId", getUserInventory);

/**
 * @route   GET /inventory/item/:id
 * @desc    Get a specific inventory item by ID
 * @access  Public
 */
router.get("/item/:id", getInventoryItemById);

/**
 * @route   PUT /inventory/:id
 * @desc    Update an inventory item (full update)
 * @body    { itemName?: string, count?: number, unit?: string, itemId?: string }
 * @access  Public
 */
router.put("/:id", updateInventoryItem);

/**
 * @route   PATCH /inventory/:id/count
 * @desc    Update only the count of an inventory item
 * @body    { count: number }
 * @access  Public
 */
router.patch("/:id/count", updateItemCount);

/**
 * @route   DELETE /inventory/:id
 * @desc    Delete an inventory item by ID
 * @access  Public
 */
router.delete("/:id", deleteInventoryItem);

export { router as inventoryRouter };
