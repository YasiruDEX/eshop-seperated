"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  LogOut,
  Sparkles,
  Send,
  Image as ImageIcon,
  Mic,
} from "lucide-react";
import ProfileIcon from "../../../assets/svgs/profile-icon";
import HeartIcon from "../../../assets/svgs/heart-icon";
import CartIcon from "../../../assets/svgs/cart-icon";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useRouter } from "next/navigation";
import { catalogueAPI, Product } from "../../utils/api";

// AI Search Response Types
interface AISearchItem {
  title: string;
  price_lkr: number;
  website: string;
  source_url: string;
  similarity_score: number;
  kg_enhanced: boolean;
  collection: string;
  original_query: string;
}

interface AISearchResponse {
  status: string;
  user_id: string;
  query: string;
  results: {
    optimized_items: AISearchItem[];
    total_cost: number;
    budget_used_percentage: number;
    items_count: number;
    total_items_found: number;
    keywords_processed: string[];
    stores_used: string[];
    estimated_delivery_hours: number;
    optimization_method: string;
    pipeline_summary: {
      keywords_extracted: number;
      items_acquired: number;
      items_personalized: number;
      items_after_logistics: number;
      final_selection: number;
      loyalty_savings: number;
    };
  };
}

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiSearchResults, setAiSearchResults] = useState<{
    [key: string]: Product[];
  }>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showFinalSelection, setShowFinalSelection] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    { product: Product; quantity: number; keyword: string }[]
  >([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [aiSearchResponse, setAiSearchResponse] =
    useState<AISearchResponse | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, isLoggedIn, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }

    // Listen for cart update events
    const handleCartUpdate = () => {
      if (isLoggedIn && user?.id) {
        fetchCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [isLoggedIn, user]);

  const fetchCartCount = async () => {
    try {
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const response = await fetch(`${GATEWAY_URL}/cart/${user?.id}`);
      const data = await response.json();
      if (data.success) {
        setCartCount(data.data.totalQuantity || 0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setCartCount(0);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // AI Mode: Search for products as user types each word
  const handleAiChatInput = (value: string) => {
    setAiChatInput(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Extract words from the input - only words with 4 or more letters
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length >= 4); // Filter words with 4+ letters

    if (words.length === 0) {
      setAiSearchResults({});
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const allProducts: Product[] = [];

      try {
        // Search for each word and collect all results
        for (const word of words) {
          const response = await catalogueAPI.searchProducts({
            searchTerm: word,
            limit: 10, // Get more results per word
          });
          if (response.success && response.data && response.data.length > 0) {
            // Add products to combined list (avoid duplicates)
            response.data.forEach((product: Product) => {
              if (!allProducts.find((p) => p.id === product.id)) {
                allProducts.push(product);
              }
            });
          }
        }

        // Sort products by price from lowest to highest
        allProducts.sort((a, b) => a.price_LKR - b.price_LKR);

        // Store all products under a single key
        setAiSearchResults(allProducts.length > 0 ? { all: allProducts } : {});
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleToggleAiMode = () => {
    setAiMode(!aiMode);
    setAiChatInput("");
    setAiSearchResults({});
    setShowFinalSelection(false);
    setSelectedProducts([]);
    setIsProcessing(false);
    setProcessingStep(0);
    setAiSearchResponse(null);
  };

  const handleImageUpload = () => {
    // Placeholder for image upload functionality
    console.log("Image upload clicked");
  };

  const handleVoiceInput = () => {
    // Placeholder for voice input functionality
    console.log("Voice input clicked");
  };

  const handleAiSend = async () => {
    if (!aiChatInput.trim()) {
      return;
    }

    if (!isLoggedIn || !user?.id) {
      alert("Please login to use AI Shopping");
      router.push("/login");
      return;
    }

    // Start processing animation
    setIsProcessing(true);
    setProcessingStep(0);

    const processingMessages = [
      "Personalizing...",
      "Optimizing budgets...",
      "Analysing logistics...",
      "Analysing loyalties...",
    ];

    // Animate through processing steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProcessingStep(step);
      if (step >= processingMessages.length) {
        clearInterval(interval);
      }
    }, 1500); // 1.5 seconds per step

    try {
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

      // Fetch user profile from customer service
      const profileResponse = await fetch(`${GATEWAY_URL}/profiles/${user.id}`);
      const profileData = await profileResponse.json();

      // Prepare user profile data
      const userProfile = {
        user_id: user.id,
        budget_limit_lkr: profileData.data?.budget_limit || 10000.0,
        location: profileData.data?.location || "Colombo, Sri Lanka",
        dietary_needs: profileData.data?.dietary_needs || {
          vegetarian: false,
          vegan: false,
          gluten_free: false,
          dairy_free: false,
          organic_only: false,
          low_sodium: false,
          sugar_free: false,
          halal: false,
          kosher: false,
          allergies: [],
        },
        brand_preferences: profileData.data?.brand_preferences || {
          preferred_brands: [],
          disliked_brands: [],
        },
        household_inventory: profileData.data?.household_inventory || {
          current_items: {},
          low_stock_threshold: 2,
        },
        loyalty_membership: profileData.data?.loyalty_membership || {
          preferred_stores: [],
          memberships: {},
        },
      };

      // Call AI Search API
      const aiResponse = await fetch(`${GATEWAY_URL}/ai-search/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiChatInput,
          user_profile: userProfile,
        }),
      });

      const aiData: AISearchResponse = await aiResponse.json();

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 6000 - step * 1500));
      clearInterval(interval);

      setAiSearchResponse(aiData);

      // Convert AI items to products
      const convertedProducts = convertAIItemsToProducts(aiData);
      setSelectedProducts(convertedProducts);

      setIsProcessing(false);
      setShowFinalSelection(true);
    } catch (error) {
      console.error("Error calling AI search:", error);
      clearInterval(interval);
      setIsProcessing(false);
      alert("Failed to get AI recommendations. Please try again.");
    }
  };

  const convertAIItemsToProducts = (aiResponse: AISearchResponse) => {
    const products: { product: Product; quantity: number; keyword: string }[] =
      [];

    aiResponse.results.optimized_items.forEach((item, index) => {
      // Map AI item to Product format
      const product: Product = {
        id: `ai-${index}`,
        title: item.title,
        price_LKR: item.price_lkr,
        currency: "LKR",
        website: item.website,
        image_url: item.source_url,
        source_url: item.source_url,
        scraped_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };

      products.push({
        product,
        quantity: 1,
        keyword:
          aiResponse.results.keywords_processed[
            Math.min(index, aiResponse.results.keywords_processed.length - 1)
          ] || "",
      });
    });

    return products;
  };

  const updateProductQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setSelectedProducts((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAllToCart = async () => {
    if (!isLoggedIn || !user?.id) {
      alert("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

      // Add all selected products to cart
      for (const item of selectedProducts) {
        let productId = item.product.id;

        // If the ID is from AI (starts with "ai-"), fetch the real product ID from catalogue
        if (productId.startsWith("ai-")) {
          try {
            // Search for the product by title in the catalogue service
            const searchResponse = await fetch(
              `${GATEWAY_URL}/catalogue/search`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  searchTerm: item.product.title,
                  limit: 1,
                }),
              }
            );
            const searchData = await searchResponse.json();

            if (
              searchData.success &&
              searchData.data &&
              searchData.data.length > 0
            ) {
              // Use the first matching product's ID
              productId = searchData.data[0].id;
              console.log(
                `Mapped AI product "${item.product.title}" to catalogue ID: ${productId}`
              );
            } else {
              console.warn(
                `Could not find product in catalogue: ${item.product.title}`
              );
              alert(
                `Product "${item.product.title}" not found in catalogue. Skipping...`
              );
              continue; // Skip this item
            }
          } catch (error) {
            console.error("Error fetching product from catalogue:", error);
            alert(`Failed to find product: ${item.product.title}`);
            continue; // Skip this item
          }
        }

        // Add to cart with the real product ID
        const cartResponse = await fetch(`${GATEWAY_URL}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            itemId: productId,
            price: item.product.price_LKR,
            quantity: item.quantity,
          }),
        });

        const cartData = await cartResponse.json();
        if (!cartData.success) {
          console.error("Failed to add to cart:", cartData);
          alert(
            `Failed to add ${item.product.title} to cart: ${cartData.message}`
          );
        }
      }

      // Dispatch custom event to refresh cart count in header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Show success message
      setShowSuccessMessage(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Close AI mode and reset after showing message
        setAiMode(false);
        setAiChatInput("");
        setAiSearchResults({});
        setShowFinalSelection(false);
        setSelectedProducts([]);
      }, 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add items to cart");
    }
  };

  const handleCloseAiMode = () => {
    setAiMode(false);
    setAiChatInput("");
    setAiSearchResults({});
    setShowFinalSelection(false);
    setSelectedProducts([]);
    setIsProcessing(false);
    setProcessingStep(0);
  };

  const handleAddToCartFromAi = async (
    product: Product,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent navigation when clicking cart button

    if (!isLoggedIn || !user?.id) {
      alert("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

      await fetch(`${GATEWAY_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          itemId: product.id,
          price: product.price_LKR,
          quantity: 1,
        }),
      });

      // Dispatch custom event to refresh cart count in header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Show success feedback (you can add a toast notification here)
      console.log("Item added to cart:", product.title);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
    }
  };

  return aiMode ? (
    // FULL-SCREEN AI MODE - Black and White Theme
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-white border-4 border-cyan-500 p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 text-cyan-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-black mb-2">Success!</h2>
              <p className="text-xl text-gray-700 mb-4">
                {selectedProducts.length}{" "}
                {selectedProducts.length === 1 ? "item" : "items"} added to your
                cart
              </p>
              <div className="text-sm text-gray-600">
                Redirecting you back to shopping...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Header - Only Logo, Wishlist, Cart, User */}
      <div className="w-full bg-white border-b-2 border-black">
        <div className="w-[90%] max-w-[1400px] py-4 m-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-black p-2 border-2 border-black">
              <span className="text-2xl font-black text-white">TS</span>
            </div>
            <span className="text-3xl font-black text-black">TitanStore</span>
          </Link>

          {/* Right Side - Wishlist, Cart, User */}
          <div className="flex items-center gap-6">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative text-black hover:text-gray-600 transition-colors"
            >
              <HeartIcon />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-bold border border-black rounded-full">
                {wishlistCount}
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-black hover:text-gray-600 transition-colors"
            >
              <CartIcon />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-bold border border-black rounded-full">
                {cartCount}
              </span>
            </Link>

            {/* User Profile */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="text-black hover:text-cyan-600 transition-colors"
              >
                <ProfileIcon />
              </button>
              <div>
                <p className="text-sm text-gray-600">Hello,</p>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="font-semibold text-black hover:text-gray-600 transition-colors"
                >
                  {isLoggedIn ? user?.name || "User" : "Sign In"}
                </button>
              </div>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white text-black border-2 border-black min-w-[180px] z-50 shadow-xl">
                  {isLoggedIn ? (
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Wishlist
                      </Link>
                      <Link
                        href="/inventory"
                        className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Kitchen Inventory
                      </Link>
                      <div className="border-t-2 border-cyan-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-cyan-500 hover:text-white cursor-pointer flex items-center gap-2 rounded"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="p-2">
                      <Link
                        href="/login"
                        className="block px-4 py-2 hover:bg-cyan-500 hover:text-white cursor-pointer rounded"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-2 hover:bg-cyan-500 hover:text-white cursor-pointer rounded"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Interface - Centered */}
      <div className="flex-1 flex flex-col items-center justify-start pt-20 px-4 overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col h-full">
          {/* AI Header - Simple Black and White */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-black">AI Shopping</h1>
          </div>

          {/* Chat Input Bar - Black and White with Cyan Send Button */}
          <div className="bg-white border-2 border-black shadow-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleImageUpload}
                className="p-3 hover:bg-gray-100 transition-colors"
                title="Upload Image"
              >
                <ImageIcon size={24} className="text-black" />
              </button>
              <button
                onClick={handleVoiceInput}
                className="p-3 hover:bg-gray-100 transition-colors"
                title="Voice Input"
              >
                <Mic size={24} className="text-black" />
              </button>
              <input
                type="text"
                placeholder="Search for products..."
                value={aiChatInput}
                onChange={(e) => handleAiChatInput(e.target.value)}
                className="flex-1 px-6 py-4 outline-none bg-gray-50 border-2 border-gray-300 focus:border-black transition-colors font-medium text-black text-lg"
                autoFocus
              />
              <button
                onClick={handleAiSend}
                className="p-4 bg-cyan-500 hover:bg-cyan-600 transition-all shadow-lg hover:shadow-xl"
                title="Send"
              >
                <Send size={24} className="text-white" />
              </button>
              <button
                onClick={handleToggleAiMode}
                className="p-4 bg-black hover:bg-gray-800 transition-colors"
                title="Exit AI Mode"
              >
                <span className="text-white font-bold text-sm">✕</span>
              </button>
            </div>
          </div>

          {/* AI Search Results - Full Product List - Black and White Theme */}
          <div className="flex-1 overflow-y-auto">
            {isProcessing ? (
              // Processing Animation Screen
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center">
                  <Sparkles
                    className="animate-spin text-black mx-auto mb-8"
                    size={64}
                  />
                  <h2 className="text-4xl font-black text-black mb-4">
                    {processingStep === 0 && "Personalizing..."}
                    {processingStep === 1 && "Optimizing budgets..."}
                    {processingStep === 2 && "Analysing logistics..."}
                    {processingStep === 3 && "Analysing loyalties..."}
                    {processingStep >= 4 && "Almost there..."}
                  </h2>
                  <div className="flex gap-2 justify-center mt-6">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-3 w-3 rounded-full transition-all ${
                          i <= processingStep ? "bg-black" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : showFinalSelection ? (
              // Final Selection Screen
              <div className="pb-8">
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-black text-black mb-2">
                    Your AI-Selected Products
                  </h2>
                  <p className="text-gray-600">
                    Review your selections and adjust quantities before adding
                    to cart
                  </p>
                </div>

                {/* AI Search Statistics - Comprehensive Results */}
                {aiSearchResponse && (
                  <div className="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-black p-6">
                    {/* Main Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-black text-black">
                          {aiSearchResponse.results.items_count}
                        </div>
                        <div className="text-xs text-gray-600 font-semibold">
                          Products Selected
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-black">
                          {aiSearchResponse.results.total_items_found}
                        </div>
                        <div className="text-xs text-gray-600 font-semibold">
                          Total Items Found
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-cyan-600">
                          {aiSearchResponse.results.budget_used_percentage}%
                        </div>
                        <div className="text-xs text-gray-600 font-semibold">
                          Budget Used
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-black">
                          LKR {aiSearchResponse.results.total_cost.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600 font-semibold">
                          Total Cost
                        </div>
                      </div>
                    </div>

                    {/* Pipeline Summary */}
                    <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
                      <h3 className="font-bold text-sm text-black mb-3">
                        AI Processing Pipeline:
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-gray-700">
                            Keywords Extracted:
                          </span>{" "}
                          <span className="text-black font-bold">
                            {
                              aiSearchResponse.results.pipeline_summary
                                .keywords_extracted
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            Items Acquired:
                          </span>{" "}
                          <span className="text-black font-bold">
                            {
                              aiSearchResponse.results.pipeline_summary
                                .items_acquired
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            Items Personalized:
                          </span>{" "}
                          <span className="text-black font-bold">
                            {
                              aiSearchResponse.results.pipeline_summary
                                .items_personalized
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            After Logistics:
                          </span>{" "}
                          <span className="text-black font-bold">
                            {
                              aiSearchResponse.results.pipeline_summary
                                .items_after_logistics
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            Final Selection:
                          </span>{" "}
                          <span className="text-black font-bold">
                            {
                              aiSearchResponse.results.pipeline_summary
                                .final_selection
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            Loyalty Savings:
                          </span>{" "}
                          <span className="text-cyan-600 font-bold">
                            LKR{" "}
                            {
                              aiSearchResponse.results.pipeline_summary
                                .loyalty_savings
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">
                          Optimization Method:
                        </span>
                        <span className="bg-black text-white px-3 py-1 text-xs font-bold">
                          {aiSearchResponse.results.optimization_method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">
                          Estimated Delivery:
                        </span>
                        <span className="bg-cyan-600 text-white px-3 py-1 text-xs font-bold">
                          ~{aiSearchResponse.results.estimated_delivery_hours}h
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs">
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">
                          Keywords Processed:
                        </span>{" "}
                        <span className="text-black">
                          {aiSearchResponse.results.keywords_processed.join(
                            ", "
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Stores Used:
                        </span>{" "}
                        <span className="text-black">
                          {aiSearchResponse.results.stores_used.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  {selectedProducts.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-gray-300 p-4 flex items-center gap-4"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
                        <img
                          src={
                            item.product.image_url || "/placeholder-product.jpg"
                          }
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-product.jpg";
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="bg-gray-200 text-black px-2 py-1 text-xs font-bold inline-block mb-2">
                              Keyword: {item.keyword}
                            </div>
                            <h3 className="font-bold text-black line-clamp-2">
                              {item.product.title}
                            </h3>
                          </div>
                          <div className="flex items-start gap-3 ml-4">
                            <div className="text-right">
                              <div className="text-2xl font-black text-black">
                                {item.product.currency}{" "}
                                {item.product.price_LKR.toFixed(2)}
                              </div>
                            </div>
                            {/* Delete Button */}
                            <button
                              onClick={() => removeProduct(index)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                              title="Remove product"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {item.product.website}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-black">
                            Quantity:
                          </span>
                          <div className="flex items-center border-2 border-black">
                            <button
                              onClick={() =>
                                updateProductQuantity(index, item.quantity - 1)
                              }
                              className="px-4 py-2 bg-white hover:bg-gray-100 text-black font-bold transition-colors"
                            >
                              −
                            </button>
                            <span className="px-6 py-2 bg-gray-50 font-bold text-black min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateProductQuantity(index, item.quantity + 1)
                              }
                              className="px-4 py-2 bg-white hover:bg-gray-100 text-black font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">
                            Subtotal: {item.product.currency}{" "}
                            {(item.product.price_LKR * item.quantity).toFixed(
                              2
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show message if all products were removed */}
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-600 font-semibold mb-6">
                      No products selected. Click below to close AI mode or
                      search again.
                    </p>
                    <button
                      onClick={handleCloseAiMode}
                      className="px-8 bg-black hover:bg-gray-800 text-white py-4 font-bold transition-colors text-lg"
                    >
                      Close AI Mode
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Total and Action Buttons */}
                    <div className="border-t-2 border-black pt-6">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-2xl font-black text-black">
                          Total:
                        </span>
                        <span className="text-3xl font-black text-black">
                          LKR{" "}
                          {selectedProducts
                            .reduce(
                              (total, item) =>
                                total + item.product.price_LKR * item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleAddAllToCart}
                          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-4 font-bold transition-all shadow-lg hover:shadow-xl text-lg"
                        >
                          Add All to Cart
                        </button>
                        <button
                          onClick={handleCloseAiMode}
                          className="px-8 bg-black hover:bg-gray-800 text-white py-4 font-bold transition-colors text-lg"
                        >
                          Close AI Mode
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : Object.keys(aiSearchResults).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                {aiSearchResults["all"]?.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border-2 border-gray-300 hover:border-black overflow-hidden transition-all hover:shadow-2xl group cursor-pointer"
                  >
                    <div
                      onClick={() => {
                        router.push(`/products/${product.id}`);
                        setAiMode(false);
                        setAiChatInput("");
                        setAiSearchResults({});
                      }}
                      className="relative h-48 overflow-hidden bg-gray-100"
                    >
                      <img
                        src={product.image_url || "/placeholder-product.jpg"}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.jpg";
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-black text-white px-3 py-1 text-xs font-bold">
                        AI
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-black mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-black text-black">
                          {product.currency} {product.price_LKR.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="bg-gray-200 text-black px-3 py-1 font-semibold">
                          {product.website}
                        </span>
                        <span className="text-gray-600 font-semibold">4.5</span>
                      </div>
                      <button
                        onClick={(e) => handleAddToCartFromAi(product, e)}
                        className="w-full bg-black hover:bg-gray-800 text-white py-3 font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : aiChatInput.trim() ? (
              <div className="text-center py-20">
                {isSearching ? (
                  <div className="flex flex-col items-center gap-4">
                    <Sparkles className="animate-spin text-black" size={48} />
                    <p className="text-xl text-gray-600 font-semibold">
                      Searching for products...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-xl text-gray-600 font-semibold">
                      AI is trying to find products for "{aiChatInput}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="flex flex-col items-center gap-6">
                  <h2 className="text-2xl font-bold text-gray-700">
                    Start typing to discover products
                  </h2>
                  <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                    <button
                      onClick={() => handleAiChatInput("laptop")}
                      className="bg-white hover:bg-gray-100 border-2 border-gray-300 hover:border-black px-6 py-3 font-semibold text-gray-700 transition-all"
                    >
                      Laptops
                    </button>
                    <button
                      onClick={() => handleAiChatInput("headphones")}
                      className="bg-white hover:bg-gray-100 border-2 border-gray-300 hover:border-black px-6 py-3 font-semibold text-gray-700 transition-all"
                    >
                      Headphones
                    </button>
                    <button
                      onClick={() => handleAiChatInput("phone")}
                      className="bg-white hover:bg-gray-100 border-2 border-gray-300 hover:border-black px-6 py-3 font-semibold text-gray-700 transition-all"
                    >
                      Phones
                    </button>
                    <button
                      onClick={() => handleAiChatInput("camera")}
                      className="bg-white hover:bg-gray-100 border-2 border-gray-300 hover:border-black px-6 py-3 font-semibold text-gray-700 transition-all"
                    >
                      Cameras
                    </button>
                    <button
                      onClick={() => handleAiChatInput("gaming")}
                      className="bg-white hover:bg-gray-100 border-2 border-gray-300 hover:border-black px-6 py-3 font-semibold text-gray-700 transition-all"
                    >
                      Gaming
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    // NORMAL MODE
    <div className="w-full bg-white border-b-2 border-black">
      {/* Main Header */}
      <div className="w-[90%] max-w-[1400px] py-5 m-auto flex items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-black p-2 border-2 border-black">
              <span className="text-2xl font-black text-white">TS</span>
            </div>
            <span className="text-3xl font-black text-black">TitanStore</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-[700px]">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 pr-32 py-3.5 border-2 border-black outline-none focus:bg-gray-100 transition-colors font-medium text-black"
              />
              <button
                type="submit"
                className="absolute top-0 right-16 h-full w-[60px] bg-black hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                <Search color="#fff" size={20} />
              </button>
              <button
                type="button"
                onClick={handleToggleAiMode}
                className="absolute top-0 right-0 h-full w-[60px] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-colors flex items-center justify-center group"
                title="Enable AI Mode"
              >
                <Sparkles
                  color="#fff"
                  size={20}
                  className="group-hover:animate-pulse"
                />
              </button>
            </form>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative text-black hover:text-gray-600 transition-colors"
          >
            <HeartIcon />
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-bold border border-black">
              {wishlistCount}
            </span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative text-black hover:text-gray-600 transition-colors"
          >
            <CartIcon />
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 flex items-center justify-center font-bold border border-black">
              {cartCount}
            </span>
          </Link>

          {/* User Profile */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="text-black hover:text-gray-600 transition-colors"
            >
              <ProfileIcon />
            </button>
            <div>
              <p className="text-sm text-gray-600">Hello,</p>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="font-semibold text-black hover:text-gray-600 transition-colors"
              >
                {isLoggedIn ? user?.name || "User" : "Sign In"}
              </button>
            </div>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white text-black border-2 border-black min-w-[180px] z-50">
                {isLoggedIn ? (
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/inventory"
                      className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Kitchen Inventory
                    </Link>
                    <div className="border-t-2 border-black my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="p-2">
                    <Link
                      href="/login"
                      className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-black text-white border-t-2 border-black">
        <div className="w-[90%] max-w-[1400px] m-auto flex items-center gap-8 py-3">
          {/* All Departments Dropdown */}
          <div className="relative">
            <button
              onClick={() => router.push("/search?q=")}
              className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-2 transition-colors font-semibold border-2 border-white"
            >
              <Menu size={20} />
              <span>All Departments</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="hover:text-gray-300 transition-colors font-semibold"
            >
              Home
            </Link>
            <button
              onClick={() => router.push("/search?q=electronics")}
              className="hover:text-gray-300 transition-colors font-semibold"
            >
              Electronics
            </button>
            <button
              onClick={() => router.push("/search?q=fashion")}
              className="hover:text-gray-300 transition-colors font-semibold"
            >
              Fashion
            </button>
            <div className="relative group">
              <button className="hover:text-gray-300 transition-colors font-semibold">
                Products ▾
              </button>
              <div className="absolute top-full left-0 mt-2 bg-white text-black border-2 border-black min-w-[200px] z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <button
                    onClick={() => router.push("/search?q=electronics")}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                  >
                    Electronics
                  </button>
                  <button
                    onClick={() => router.push("/search?q=fashion")}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                  >
                    Fashion
                  </button>
                  <button
                    onClick={() => router.push("/search?q=home")}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                  >
                    Home & Garden
                  </button>
                  <button
                    onClick={() => router.push("/search?q=kitchen")}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                  >
                    Kitchen
                  </button>
                  <button
                    onClick={() => router.push("/search?q=sports")}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                  >
                    Sports
                  </button>
                  <button
                    onClick={() => router.push("/search?q=books")}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                  >
                    Books
                  </button>
                  <button
                    onClick={() => router.push("/search?q=toys")}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                  >
                    Toys
                  </button>
                  <button
                    onClick={() => router.push("/search?q=beauty")}
                    className="w-full text-left px-4 py-2 hover:bg-black hover:text-white cursor-pointer"
                  >
                    Beauty & Health
                  </button>
                </div>
              </div>
            </div>
            <Link
              href="/become-seller"
              className="bg-white text-black hover:bg-gray-200 px-4 py-1.5 font-semibold transition-colors border-2 border-white"
            >
              Become A Seller
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
