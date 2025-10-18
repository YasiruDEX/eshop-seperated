"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import { useWishlist } from "../../shared/context/WishlistContext";
import { useToast } from "../../shared/hooks/useToast";
import { useRouter } from "next/navigation";
import { wishlistAPI, catalogueAPI, cartAPI } from "../../shared/utils/api";

interface WishlistItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

interface Product {
  id: string;
  title: string;
  price_LKR: number;
  currency: string;
  image_url: string;
  website: string;
  source_url: string;
}

const WishlistPage = () => {
  const { isLoggedIn, user } = useAuth();
  const { wishlistCount, refreshWishlistCount, removeFromWishlist } = useWishlist();
  const { success, error: showError, ToastContainer } = useToast();
  const router = useRouter();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (user?.id) {
      fetchWishlist();
    }
  }, [isLoggedIn, user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getUserWishlist(user!.id);
      
      if (response.success) {
        const items = response.data || [];
        setWishlistItems(items);

        // Fetch product details for each item
        const productPromises = items.map((item: WishlistItem) =>
          catalogueAPI.getProductById(item.itemId).catch(() => null)
        );

        const productResponses = await Promise.all(productPromises);
        const productMap = new Map<string, Product>();

        productResponses.forEach((res, index) => {
          if (res && res.success) {
            productMap.set(items[index].itemId, res.data);
          }
        });

        setProducts(productMap);
      }
    } catch (err: any) {
      console.error("Error fetching wishlist:", err);
      showError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string, wishlistId: string) => {
    try {
      setRemovingId(wishlistId);
      await removeFromWishlist(itemId);
      
      // Remove from local state
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      setProducts(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });

      success("✓ Removed from wishlist");
      
      // Dispatch event to update header
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      showError("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCartId(product.id);
      await cartAPI.addToCart({
        userId: user!.id,
        itemId: product.id,
        price: product.price_LKR,
        quantity: 1,
      });

      // Dispatch custom event to refresh cart count in header
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      success("✓ Item added to cart successfully!");
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      showError("Failed to add item to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black mb-2 flex items-center gap-3">
            <Heart size={40} className="fill-red-500 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={80} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-black text-black mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 mb-6">
              Save your favorite items to wishlist and shop them later!
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((item) => {
              const product = products.get(item.itemId);
              
              if (!product) {
                return null; // Skip if product not found
              }

              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-black hover:border-gray-600 transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <Link href={`/products/${product.id}`}>
                      <img
                        src={product.image_url || "/placeholder-product.jpg"}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </Link>
                  </div>

                  <div className="p-5">
                    <Link href={`/products/${product.id}`}>
                      <h3
                        className="text-lg font-bold text-black mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors cursor-pointer"
                        title={product.title}
                      >
                        {product.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-3xl font-black text-black">
                          {product.currency} {product.price_LKR.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="bg-gray-100 text-black px-3 py-1 font-semibold text-xs border border-black">
                        {product.website}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingToCartId === product.id}
                        className="flex-1 bg-black text-white text-center py-3 hover:bg-gray-800 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {addingToCartId === product.id ? (
                          <>...</>
                        ) : (
                          <>
                            <ShoppingCart size={18} />
                            Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRemoveFromWishlist(product.id, item.id)}
                        disabled={removingId === item.id}
                        className="bg-white text-red-600 border-2 border-red-600 px-5 py-3 hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from wishlist"
                      >
                        {removingId === item.id ? "..." : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black text-white border-t-4 border-black mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-black text-xl mb-4">TitanStore</h3>
              <p className="text-gray-400">
                Your ultimate destination for quality shopping.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/profile" className="hover:text-white">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-white">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="hover:text-white">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-white">
                    Shopping Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TitanStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WishlistPage;
