import { Request, Response } from "express";
import { PrismaClient } from "../../../../generated/prisma-customer";

const prisma = new PrismaClient();

export const saveProfile = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      budgetLimitLkr,
      location,
      dietaryNeeds,
      brandPreferences,
      householdInventory,
      loyaltyMembership,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const profileData: any = {
      userId,
      budgetLimitLkr: budgetLimitLkr || 0,
      location: location || "",
    };

    // Dietary needs
    if (dietaryNeeds) {
      profileData.vegetarian = dietaryNeeds.vegetarian || false;
      profileData.vegan = dietaryNeeds.vegan || false;
      profileData.glutenFree = dietaryNeeds.gluten_free || false;
      profileData.dairyFree = dietaryNeeds.dairy_free || false;
      profileData.organicOnly = dietaryNeeds.organic_only || false;
      profileData.lowSodium = dietaryNeeds.low_sodium || false;
      profileData.sugarFree = dietaryNeeds.sugar_free || false;
      profileData.halal = dietaryNeeds.halal || false;
      profileData.kosher = dietaryNeeds.kosher || false;
      profileData.allergies = dietaryNeeds.allergies || [];
    }

    // Brand preferences
    if (brandPreferences) {
      profileData.preferredBrands = brandPreferences.preferred_brands || [];
      profileData.dislikedBrands = brandPreferences.disliked_brands || [];
    }

    // Household inventory
    if (householdInventory) {
      profileData.currentItems = householdInventory.current_items || {};
      profileData.lowStockThreshold =
        householdInventory.low_stock_threshold || 2;
    }

    // Loyalty membership
    if (loyaltyMembership) {
      profileData.preferredStores = loyaltyMembership.preferred_stores || [];
      profileData.memberships = loyaltyMembership.memberships || {};
    }

    // Upsert profile (create or update)
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: profileData,
    });

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (error: any) {
    console.error("Error saving profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save profile",
      error: error.message,
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Transform data to match expected format
    const formattedProfile = {
      user_id: profile.userId,
      budget_limit_lkr: profile.budgetLimitLkr,
      location: profile.location,
      dietary_needs: {
        vegetarian: profile.vegetarian,
        vegan: profile.vegan,
        gluten_free: profile.glutenFree,
        dairy_free: profile.dairyFree,
        organic_only: profile.organicOnly,
        low_sodium: profile.lowSodium,
        sugar_free: profile.sugarFree,
        halal: profile.halal,
        kosher: profile.kosher,
        allergies: profile.allergies,
      },
      brand_preferences: {
        preferred_brands: profile.preferredBrands,
        disliked_brands: profile.dislikedBrands,
      },
      household_inventory: {
        current_items: profile.currentItems,
        low_stock_threshold: profile.lowStockThreshold,
      },
      loyalty_membership: {
        preferred_stores: profile.preferredStores,
        memberships: profile.memberships,
      },
    };

    res.status(200).json({
      success: true,
      data: formattedProfile,
    });
  } catch (error: any) {
    console.error("Error getting profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};
