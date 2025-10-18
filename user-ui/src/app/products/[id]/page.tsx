"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  catalogueAPI,
  cartAPI,
  Product,
  wishlistAPI,
} from "../../../shared/utils/api";
import { useAuth } from "../../../shared/context/AuthContext";
import { Minus, Plus, ShoppingCart, ArrowLeft, Heart } from "lucide-react";
import { useToast } from "../../../shared/hooks/useToast";
import { useWishlist } from "../../../shared/context/WishlistContext";

const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, user } = useAuth();
  const { success, error: showError, ToastContainer } = useToast();
  useWishlist(); // Initialize wishlist context

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (product) {
      fetchRecommendations();
      if (isLoggedIn && user?.id) {
        checkWishlistStatus();
      }
    }
  }, [product, isLoggedIn, user]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await catalogueAPI.getProductById(id);
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError("Product not found");
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!product) return;

    try {
      setLoadingRecommendations(true);

      // Extract words from the title (remove common words and short words)
      const stopWords = [
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
      ];
      const titleWords = product.title
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.includes(word));

      // Search for each word and collect results (3 results per word)
      const allRecommendations = new Map<string, Product>();

      for (const word of titleWords) {
        try {
          const response = await catalogueAPI.searchProducts({
            searchTerm: word,
            limit: 3,
          });

          if (response.success && response.data) {
            response.data.forEach((item: Product) => {
              // Don't include the current product in recommendations
              if (item.id !== params.id && !allRecommendations.has(item.id)) {
                allRecommendations.set(item.id, item);
              }
            });
          }
        } catch (err) {
          console.error(`Error searching for word "${word}":`, err);
        }
      }

      // Convert map to array and limit to 12 items
      const recommendedProducts = Array.from(allRecommendations.values()).slice(
        0,
        12
      );
      setRecommendations(recommendedProducts);
    } catch (err: any) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.isItemInWishlist(
        user!.id,
        params.id as string
      );
      if (response.success) {
        setIsInWishlist(response.inWishlist);
      }
    } catch (err) {
      console.error("Error checking wishlist status:", err);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn || !user?.id) {
      showError("Please login to add items to cart");
      router.push("/login");
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      await cartAPI.addToCart({
        userId: user.id,
        itemId: product.id,
        price: product.price_LKR,
        quantity: quantity,
      });

      // Dispatch custom event to refresh cart count in header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      success(`✓ Added ${quantity} item(s) to cart successfully!`);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      showError("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedIn || !user?.id) {
      showError("Please login to use wishlist");
      router.push("/login");
      return;
    }

    try {
      setTogglingWishlist(true);

      if (isInWishlist) {
        await wishlistAPI.removeFromWishlistByItem(
          user.id,
          params.id as string
        );
        setIsInWishlist(false);
        success("✓ Removed from wishlist");
      } else {
        await wishlistAPI.addToWishlist({
          userId: user.id,
          itemId: params.id as string,
        });
        setIsInWishlist(true);
        success("✓ Added to wishlist");
      }

      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (err: any) {
      console.error("Error toggling wishlist:", err);
      showError("Failed to update wishlist");
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            {error || "Product not found"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-6 py-2 hover:bg-gray-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-black hover:text-gray-600 mb-8 font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative border-2 border-black p-8 bg-gray-50">
            <img
              src={product.image_url || "/placeholder-product.png"}
              alt={product.title}
              className="w-full h-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-product.png";
              }}
            />

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              disabled={togglingWishlist}
              className="absolute top-4 right-4 bg-white hover:bg-gray-100 p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-black"
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={24}
                className={`transition-all duration-300 ${
                  isInWishlist
                    ? "fill-red-500 text-red-500"
                    : "fill-none text-black"
                }`}
              />
            </button>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-black mb-4">
              {product.title}
            </h1>

            <div className="mb-6">
              <span className="bg-gray-100 text-black px-4 py-2 font-semibold text-sm border border-black">
                {product.website}
              </span>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-black">
                  {product.currency} {product.price_LKR.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-b-2 border-black py-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-black">Quantity:</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-2xl font-bold text-black w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-black">Total:</span>
                <span className="text-3xl font-black text-black">
                  {product.currency} {(product.price_LKR * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full bg-black text-white py-4 hover:bg-gray-800 transition-colors font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                {addingToCart ? "Adding to Cart..." : "Add to Cart"}
              </button>

              <a
                href={product.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white text-black border-2 border-black py-4 hover:bg-gray-100 transition-colors font-bold text-lg flex items-center justify-center"
              >
                View on {product.website}
              </a>
            </div>

            <div className="mt-8 border-2 border-black p-6 bg-gray-50">
              <h3 className="text-xl font-bold text-black mb-4">
                Product Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Website:</span>
                  <span className="font-semibold text-black">
                    {product.website}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-semibold text-black">
                    {product.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold text-black">⭐ 4.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="border-t-4 border-black pt-12 mt-16">
            <h2 className="text-3xl font-black text-black mb-8">
              You Might Also Like
            </h2>

            {loadingRecommendations ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 p-4 animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-200 mb-4"></div>
                    <div className="h-4 bg-gray-200 mb-2"></div>
                    <div className="h-4 bg-gray-200 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/products/${item.id}`)}
                    className="bg-white border-2 border-black hover:border-gray-600 transition-all duration-300 overflow-hidden cursor-pointer group"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img
                        src={item.image_url || "/placeholder-product.png"}
                        alt={item.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.png";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3
                        className="text-sm font-bold text-black mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xl font-black text-black">
                        {item.currency} {item.price_LKR.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        {item.website}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
