"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("../controllers/review.controller");
const router = express_1.default.Router();
// Submit a review for a product
router.post("/submit", review_controller_1.submitProductReview);
// Get batch review stats for multiple items
router.post("/batch", review_controller_1.getBatchReviews);
// Get all reviews for an item
router.get("/item/:itemId", review_controller_1.getItemReviews);
// Get review statistics/aggregation for an item
router.get("/stats/:itemId", review_controller_1.getItemReviewStats);
// Mark a review as helpful
router.post("/helpful/:reviewId", review_controller_1.markHelpful);
// Get reviews by order ID
router.get("/order/:orderId", review_controller_1.getOrderReviews);
exports.default = router;
