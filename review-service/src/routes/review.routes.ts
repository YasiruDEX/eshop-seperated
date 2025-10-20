import express, { Router } from "express";
import {
  submitProductReview,
  getItemReviews,
  getItemReviewStats,
  markHelpful,
  getOrderReviews,
  getBatchReviews,
} from "../controllers/review.controller";

const router: Router = express.Router();

// Submit a review for a product
router.post("/submit", submitProductReview);

// Get batch review stats for multiple items
router.post("/batch", getBatchReviews);

// Get all reviews for an item
router.get("/item/:itemId", getItemReviews);

// Get review statistics/aggregation for an item
router.get("/stats/:itemId", getItemReviewStats);

// Mark a review as helpful
router.post("/helpful/:reviewId", markHelpful);

// Get reviews by order ID
router.get("/order/:orderId", getOrderReviews);

export default router;
