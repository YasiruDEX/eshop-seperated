"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatchReviews = exports.getOrderReviews = exports.markHelpful = exports.getItemReviewStats = exports.getItemReviews = exports.submitProductReview = void 0;
const review_service_1 = require("../services/review.service");
const submitProductReview = async (req, res, next) => {
    try {
        const { itemId, orderId, userId, userName, userEmail, rating, comment, verified, } = req.body;
        // Validation
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "itemId is required",
            });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "rating is required and must be between 1 and 5",
            });
        }
        if (!comment || comment.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "comment is required",
            });
        }
        const review = await (0, review_service_1.submitReview)({
            itemId,
            orderId,
            userId,
            userName,
            userEmail,
            rating,
            comment,
            verified,
        });
        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review,
        });
    }
    catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit review",
            error: error.message,
        });
    }
};
exports.submitProductReview = submitProductReview;
const getItemReviews = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "itemId is required",
            });
        }
        const result = await (0, review_service_1.getReviewsByItemId)(itemId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error("Error getting reviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get reviews",
            error: error.message,
        });
    }
};
exports.getItemReviews = getItemReviews;
const getItemReviewStats = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "itemId is required",
            });
        }
        const aggregation = await (0, review_service_1.getReviewAggregation)(itemId);
        res.status(200).json({
            success: true,
            data: aggregation,
        });
    }
    catch (error) {
        console.error("Error getting review stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get review stats",
            error: error.message,
        });
    }
};
exports.getItemReviewStats = getItemReviewStats;
const markHelpful = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        if (!reviewId) {
            return res.status(400).json({
                success: false,
                message: "reviewId is required",
            });
        }
        const review = await (0, review_service_1.markReviewHelpful)(reviewId);
        res.status(200).json({
            success: true,
            message: "Review marked as helpful",
            data: review,
        });
    }
    catch (error) {
        console.error("Error marking review helpful:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark review helpful",
            error: error.message,
        });
    }
};
exports.markHelpful = markHelpful;
const getOrderReviews = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "orderId is required",
            });
        }
        const reviews = await (0, review_service_1.getReviewsByOrderId)(orderId);
        res.status(200).json({
            success: true,
            data: reviews,
        });
    }
    catch (error) {
        console.error("Error getting order reviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get order reviews",
            error: error.message,
        });
    }
};
exports.getOrderReviews = getOrderReviews;
const getBatchReviews = async (req, res, next) => {
    try {
        const { itemIds } = req.body;
        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "itemIds is required and must be a non-empty array",
            });
        }
        const stats = await (0, review_service_1.getBatchReviewStats)(itemIds);
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error("Error getting batch reviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get batch reviews",
            error: error.message,
        });
    }
};
exports.getBatchReviews = getBatchReviews;
