"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { wishlistAPI } from "../utils/api";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlistCount: () => Promise<void>;
  isInWishlist: (itemId: string) => Promise<boolean>;
  addToWishlist: (itemId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlistCount = async () => {
    if (!isLoggedIn || !user?.id) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await wishlistAPI.getWishlistCount(user.id);
      setWishlistCount(response.count || 0);
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
    }
  };

  const isInWishlist = async (itemId: string): Promise<boolean> => {
    if (!isLoggedIn || !user?.id) return false;

    try {
      const response = await wishlistAPI.isItemInWishlist(user.id, itemId);
      return response.inWishlist || false;
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  };

  const addToWishlist = async (itemId: string) => {
    if (!isLoggedIn || !user?.id) {
      throw new Error("User must be logged in to add to wishlist");
    }

    try {
      await wishlistAPI.addToWishlist({
        userId: user.id,
        itemId,
      });
      await refreshWishlistCount();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (!isLoggedIn || !user?.id) {
      throw new Error("User must be logged in to remove from wishlist");
    }

    try {
      await wishlistAPI.removeFromWishlistByItem(user.id, itemId);
      await refreshWishlistCount();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  };

  // Refresh wishlist count on mount and when user changes
  useEffect(() => {
    refreshWishlistCount();
  }, [user?.id, isLoggedIn]);

  // Listen for wishlist updates from other components
  useEffect(() => {
    const handleWishlistUpdated = () => {
      refreshWishlistCount();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, [user?.id]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount,
        refreshWishlistCount,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
