const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userName?: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

export interface ReviewAggregation {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  success: boolean;
  data?: {
    reviews: Review[];
    aggregation: ReviewAggregation;
  };
  error?: string;
}

export interface SubmitReviewData {
  itemId: string;
  orderId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  comment: string;
  verified?: boolean;
}

export const reviewAPI = {
  // Get batch review stats for multiple items
  getBatchReviewStats: async (
    itemIds: string[]
  ): Promise<{
    success: boolean;
    data?: Record<string, { averageRating: number; totalReviews: number }>;
    error?: string;
  }> => {
    try {
      const response = await fetch(`${GATEWAY_URL}/reviews/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemIds }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching batch reviews:", error);
      return {
        success: false,
        error: "Failed to fetch batch reviews",
      };
    }
  },

  // Get reviews for an item
  getReviewsByItemId: async (itemId: string): Promise<ReviewsResponse> => {
    try {
      const response = await fetch(`${GATEWAY_URL}/reviews/item/${itemId}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return {
        success: false,
        error: "Failed to fetch reviews",
      };
    }
  },

  // Get review statistics for an item
  getReviewStats: async (itemId: string): Promise<ReviewsResponse> => {
    try {
      const response = await fetch(`${GATEWAY_URL}/reviews/stats/${itemId}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching review stats:", error);
      return {
        success: false,
        error: "Failed to fetch review statistics",
      };
    }
  },

  // Submit a new review
  submitReview: async (reviewData: SubmitReviewData): Promise<any> => {
    try {
      const response = await fetch(`${GATEWAY_URL}/reviews/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error submitting review:", error);
      return {
        success: false,
        error: "Failed to submit review",
      };
    }
  },

  // Mark a review as helpful
  markHelpful: async (reviewId: string): Promise<any> => {
    try {
      const response = await fetch(
        `${GATEWAY_URL}/reviews/helpful/${reviewId}`,
        {
          method: "POST",
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      return {
        success: false,
        error: "Failed to mark review as helpful",
      };
    }
  },

  // Get reviews by order ID
  getReviewsByOrderId: async (
    orderId: string
  ): Promise<{
    success: boolean;
    data?: Review[];
    error?: string;
  }> => {
    try {
      const response = await fetch(`${GATEWAY_URL}/reviews/order/${orderId}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching order reviews:", error);
      return {
        success: false,
        error: "Failed to fetch order reviews",
      };
    }
  },
};
