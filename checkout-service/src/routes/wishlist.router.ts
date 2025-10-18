import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  removeFromWishlistByItem,
  getUserWishlist,
  getWishlistCount,
  isItemInWishlist,
} from "../controller/wishlist.controller";

const router = express.Router();

// Add to wishlist
router.post("/", addToWishlist);

// Get user's wishlist
router.get("/:userId", getUserWishlist);

// Get wishlist count
router.get("/:userId/count", getWishlistCount);

// Check if item is in wishlist
router.get("/:userId/item/:itemId", isItemInWishlist);

// Remove from wishlist by ID
router.delete("/:id", removeFromWishlist);

// Remove from wishlist by userId and itemId
router.delete("/user/:userId/item/:itemId", removeFromWishlistByItem);

export default router;
