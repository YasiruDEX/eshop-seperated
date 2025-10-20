import { PrismaClient as ReviewPrismaClient } from "../../../../generated/prisma-review";

const reviewPrisma = new ReviewPrismaClient();

export interface SubmitReviewParams {
  itemId: string;
  orderId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  comment: string;
  verified?: boolean;
}

export const submitReview = async (params: SubmitReviewParams) => {
  const {
    itemId,
    orderId,
    userId,
    userName,
    userEmail,
    rating,
    comment,
    verified = false,
  } = params;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Create review in reviews database
  const review = await reviewPrisma.comments.create({
    data: {
      itemId,
      orderId,
      userId,
      userName,
      userEmail,
      rating,
      comment,
      verified,
    },
  });

  // Update aggregated reviews in catalogue collection
  await updateCatalogueReviews(itemId);

  return review;
};

export const updateCatalogueReviews = async (itemId: string) => {
  // Get all reviews for this item
  const reviews = await reviewPrisma.comments.findMany({
    where: { itemId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return null;
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  const reviewCount = reviews.length;

  // Update or create catalogue item reviews in the same database
  try {
    await reviewPrisma.catalogue.upsert({
      where: { id: itemId },
      update: {
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10,
      },
      create: {
        id: itemId,
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });

    console.log(
      `✅ Updated catalogue for item ${itemId}: ${reviewCount} reviews, ${averageRating.toFixed(
        1
      )} avg rating`
    );
  } catch (error) {
    console.error(`Failed to update catalogue for item ${itemId}:`, error);
  }

  return {
    reviewCount,
    averageRating: Math.round(averageRating * 10) / 10,
  };
};

export const getReviewsByItemId = async (itemId: string) => {
  const reviews = await reviewPrisma.comments.findMany({
    where: { itemId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      userName: true,
      verified: true,
      helpful: true,
      createdAt: true,
    },
  });

  // Get aggregated data
  const aggregation = await getReviewAggregation(itemId);

  return {
    reviews,
    aggregation,
  };
};

export const getReviewAggregation = async (itemId: string) => {
  const reviews = await reviewPrisma.comments.findMany({
    where: { itemId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  // Calculate rating distribution
  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return {
    totalReviews: reviews.length,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
  };
};

export const markReviewHelpful = async (reviewId: string) => {
  const review = await reviewPrisma.comments.update({
    where: { id: reviewId },
    data: {
      helpful: { increment: 1 },
    },
  });

  return review;
};

export const getReviewsByOrderId = async (orderId: string) => {
  const reviews = await reviewPrisma.comments.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

export const getBatchReviewStats = async (itemIds: string[]) => {
  try {
    // Get all reviews for the given items
    const reviews = await reviewPrisma.comments.findMany({
      where: { itemId: { in: itemIds } },
      select: { itemId: true, rating: true },
    });

    // Group reviews by itemId and calculate stats
    const statsByItem: Record<
      string,
      { averageRating: number; totalReviews: number }
    > = {};

    itemIds.forEach((itemId) => {
      const itemReviews = reviews.filter((r) => r.itemId === itemId);

      if (itemReviews.length === 0) {
        statsByItem[itemId] = {
          totalReviews: 0,
          averageRating: 0,
        };
      } else {
        const totalRating = itemReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating = totalRating / itemReviews.length;

        statsByItem[itemId] = {
          totalReviews: itemReviews.length,
          averageRating: Math.round(averageRating * 10) / 10,
        };
      }
    });

    return statsByItem;
  } catch (error) {
    // If there's an error (like invalid ObjectId), return 0 ratings for all items
    console.error("Error in getBatchReviewStats:", error);
    const statsByItem: Record<
      string,
      { averageRating: number; totalReviews: number }
    > = {};
    itemIds.forEach((itemId) => {
      statsByItem[itemId] = {
        totalReviews: 0,
        averageRating: 0,
      };
    });
    return statsByItem;
  }
};
