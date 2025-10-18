"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  catalogueAPI,
  cartAPI,
  wishlistAPI,
  Product,
} from "../shared/utils/api";
import { useAuth } from "../shared/context/AuthContext";
import { useWishlist } from "../shared/context/WishlistContext";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useToast } from "../shared/hooks/useToast";

const HomePage = () => {
  const { isLoggedIn, user } = useAuth();
  const { refreshWishlistCount } = useWishlist();
  const router = useRouter();
  const { success, error: showError, ToastContainer } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(
    new Set()
  );
  const [togglingWishlist, setTogglingWishlist] = useState<string | null>(null);
  const itemsPerPage = 24;
  const totalItemsToFetch = 100;

  useEffect(() => {
    fetchProducts();
    if (isLoggedIn && user?.id) {
      fetchUserWishlist();
    }
  }, [isLoggedIn, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await catalogueAPI.filterProducts({
        limit: totalItemsToFetch,
        offset: 0,
      });
      setProducts(response.data || []);
      setTotalProducts(response.data?.length || 0);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWishlist = async () => {
    try {
      const response = await wishlistAPI.getUserWishlist(user!.id);
      if (response.success) {
        const items = response.data || [];
        const itemIds = new Set<string>(items.map((item: any) => item.itemId));
        setWishlistedItems(itemIds);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!isLoggedIn || !user?.id) {
      showError("Please login to use wishlist");
      router.push("/login");
      return;
    }

    try {
      setTogglingWishlist(productId);
      const isInWishlist = wishlistedItems.has(productId);

      if (isInWishlist) {
        await wishlistAPI.removeFromWishlistByItem(user.id, productId);
        setWishlistedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        success("✓ Removed from wishlist");
      } else {
        await wishlistAPI.addToWishlist({
          userId: user.id,
          itemId: productId,
        });
        setWishlistedItems((prev) => new Set(prev).add(productId));
        success("✓ Added to wishlist");
      }

      // Dispatch event to update header count
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (error: any) {
      console.error("Error toggling wishlist:", error);
      showError("Failed to update wishlist");
    } finally {
      setTogglingWishlist(null);
    }
  };

  // Frontend pagination
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn || !user?.id) {
      showError("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      setAddingToCart(product.id);
      await cartAPI.addToCart({
        userId: user.id,
        itemId: product.id,
        price: product.price_LKR,
        quantity: 1,
      });

      // Dispatch custom event to refresh cart count in header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      success("✓ Item added to cart successfully!");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      showError("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToastContainer />
      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16 flex-grow">
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-black mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600">
              {totalProducts > 0
                ? `Showing ${startIndex + 1} to ${Math.min(
                    endIndex,
                    totalProducts
                  )} of ${totalProducts} products`
                : "Handpicked deals just for you"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
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
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 bg-black text-white px-6 py-2 hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {paginatedProducts.map((product) => {
              const isInWishlist = wishlistedItems.has(product.id);
              const isTogglingThis = togglingWishlist === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white border-2 border-black hover:border-gray-600 transition-all duration-300 overflow-hidden group relative min-w-0 w-full"
                >
                  <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.image_url || "/placeholder-product.png"}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 cursor-pointer p-1 sm:p-2"
                      onClick={() => router.push(`/products/${product.id}`)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-product.png";
                      }}
                    />
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black text-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold">
                      NEW
                    </div>
                    {/* Wishlist Button */}
                    <button
                      onClick={() => handleToggleWishlist(product.id)}
                      disabled={isTogglingThis}
                      className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white hover:bg-gray-100 p-1.5 sm:p-2 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      title={
                        isInWishlist
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        size={18}
                        className={`sm:w-5 sm:h-5 transition-all duration-300 ${
                          isInWishlist
                            ? "fill-red-500 text-red-500"
                            : "fill-none text-black"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-3 sm:p-5">
                    <h3
                      className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors cursor-pointer break-words"
                      title={product.title}
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      {product.title}
                    </h3>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                      <div className="min-w-0">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-black text-black break-words">
                          {product.currency} {product.price_LKR.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-sm gap-2 mb-3 sm:mb-4">
                      <span className="bg-gray-100 text-black px-2 sm:px-3 py-1 font-semibold text-xs border border-black whitespace-nowrap">
                        {product.website}
                      </span>
                      <span className="text-black font-semibold whitespace-nowrap">
                        ⭐ 4.5
                      </span>
                    </div>
                    <div className="flex gap-2 min-w-0">
                      <button
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="flex-1 min-w-0 bg-black text-white text-center py-2 sm:py-3 hover:bg-gray-800 transition-colors font-bold text-xs sm:text-sm lg:text-base"
                      >
                        View Product
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCart === product.id}
                        className="flex-shrink-0 bg-white text-black border-2 border-black px-2 sm:px-3 lg:px-5 py-2 sm:py-3 hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {addingToCart === product.id ? "..." : "🛒"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && products.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-10 h-10 border-2 border-black font-bold transition-colors ${
                      currentPage === pageNumber
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black text-white border-t-4 border-black mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-black mb-4">TitanStore</h3>
              <p className="text-gray-400 text-sm">
                Your one-stop destination for the best deals from top online
                retailers.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shops"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Shops
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offers"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Offers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-bold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Returns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Seller */}
            <div>
              <h4 className="text-lg font-bold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="https://eshop-seller.vercel.app"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Become a Seller
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://eshop-seller.vercel.app"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Seller Benefits
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://eshop-seller.vercel.app"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Seller FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 TitanStore. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
