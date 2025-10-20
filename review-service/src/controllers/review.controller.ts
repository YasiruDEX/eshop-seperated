import { Request, Response, NextFunction } from "express";
import {
  submitReview,
  getReviewsByItemId,
  getReviewAggregation,
  markReviewHelpful,
  getReviewsByOrderId,
  getBatchReviewStats,
} from "../services/review.service";

export const submitProductReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      itemId,
      orderId,
      userId,
      userName,
      userEmail,
      rating,
      comment,
      verified,
    } = req.body;

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

    const review = await submitReview({
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
  } catch (error: any) {
    console.error("Error submitting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

export const getItemReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "itemId is required",
      });
    }

    const result = await getReviewsByItemId(itemId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error getting reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};

export const getItemReviewStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "itemId is required",
      });
    }

    const aggregation = await getReviewAggregation(itemId);

    res.status(200).json({
      success: true,
      data: aggregation,
    });
  } catch (error: any) {
    console.error("Error getting review stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get review stats",
      error: error.message,
    });
  }
};

export const markHelpful = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "reviewId is required",
      });
    }

    const review = await markReviewHelpful(reviewId);

    res.status(200).json({
      success: true,
      message: "Review marked as helpful",
      data: review,
    });
  } catch (error: any) {
    console.error("Error marking review helpful:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark review helpful",
      error: error.message,
    });
  }
};

export const getOrderReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const reviews = await getReviewsByOrderId(orderId);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error("Error getting order reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order reviews",
      error: error.message,
    });
  }
};

export const getBatchReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "itemIds is required and must be a non-empty array",
      });
    }

    const stats = await getBatchReviewStats(itemIds);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error getting batch reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get batch reviews",
      error: error.message,
    });
  }
};
