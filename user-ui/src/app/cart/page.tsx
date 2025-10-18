"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cartAPI, catalogueAPI, Product } from "../../shared/utils/api";
import { useAuth } from "../../shared/context/AuthContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CartItemWithProduct {
  id: string;
  userId: string;
  itemId: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

const CartPage = () => {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [totals, setTotals] = useState({
    itemCount: 0,
    totalQuantity: 0,
    total: 0,
  });

  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      router.push("/login");
      return;
    }
    fetchCart();
  }, [isLoggedIn, user]);

  const fetchCart = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError("");
      const response = await cartAPI.getUserCart(user.id);

      if (response.success) {
        const items = response.data.items || [];

        // Fetch product details for each cart item
        const itemsWithProducts = await Promise.all(
          items.map(async (item: CartItemWithProduct) => {
            try {
              const productResponse = await catalogueAPI.getProductById(
                item.itemId
              );
              return {
                ...item,
                product: productResponse.data,
              };
            } catch (error) {
              console.error(`Error fetching product ${item.itemId}:`, error);
              return item;
            }
          })
        );

        setCartItems(itemsWithProducts);
        setTotals({
          itemCount: response.data.itemCount || 0,
          totalQuantity: response.data.totalQuantity || 0,
          total: response.data.total || 0,
        });
      }
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (
    itemId: string,
    currentQuantity: number,
    delta: number
  ) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;

    try {
      setUpdatingItem(itemId);
      await cartAPI.updateCartItem(itemId, { quantity: newQuantity });
      await fetchCart();
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      alert("Failed to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setRemovingItem(itemId);
      await cartAPI.removeFromCart(itemId);
      await fetchCart();
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error: any) {
      console.error("Error removing cart item:", error);
      alert("Failed to remove item");
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = async () => {
    if (!user?.id || cartItems.length === 0) return;

    try {
      setProcessingCheckout(true);

      // Call the checkout endpoint
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const response = await fetch(`${GATEWAY_URL}/cart/checkout/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail: user.email,
          customerName: user.name,
          currency: "lkr",
        }),
      });

      const data = await response.json();

      if (data.success && data.data.sessionUrl) {
        // Redirect to Stripe payment page
        window.location.href = data.data.sessionUrl;
      } else {
        throw new Error(data.message || "Checkout failed");
      }
    } catch (error: any) {
      console.error("Error during checkout:", error);
      alert("Failed to process checkout. Please try again.");
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 flex-grow">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-black hover:text-gray-600 mb-4 font-semibold"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
          <h1 className="text-4xl font-black text-black mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={fetchCart}
              className="bg-black text-white px-6 py-2 hover:bg-gray-800"
            >
              Retry
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={80} className="mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-black mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some products to get started!
            </p>
            <Link
              href="/"
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 inline-block font-bold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-black p-4 bg-white hover:border-gray-600 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-32 h-32 flex-shrink-0 border-2 border-black bg-gray-50">
                      <img
                        src={
                          item.product?.image_url || "/placeholder-product.jpg"
                        }
                        alt={item.product?.title || "Product"}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => router.push(`/products/${item.itemId}`)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <h3
                        className="text-lg font-bold text-black mb-2 cursor-pointer hover:text-gray-600 line-clamp-2"
                        onClick={() => router.push(`/products/${item.itemId}`)}
                      >
                        {item.product?.title || "Product"}
                      </h3>

                      {item.product?.website && (
                        <span className="inline-block bg-gray-100 text-black px-3 py-1 text-xs font-semibold border border-black mb-3">
                          {item.product.website}
                        </span>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity, -1)
                            }
                            disabled={
                              updatingItem === item.id || item.quantity <= 1
                            }
                            className="w-8 h-8 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-xl font-bold text-black w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity, 1)
                            }
                            disabled={updatingItem === item.id}
                            className="w-8 h-8 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-2xl font-black text-black">
                            {item.product?.currency || "LKR"}{" "}
                            {(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.product?.currency || "LKR"}{" "}
                            {item.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removingItem === item.id}
                      className="text-black hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border-2 border-black p-6 bg-white sticky top-4">
                <h2 className="text-2xl font-black text-black mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totals.itemCount} items)</span>
                    <span className="font-semibold">
                      LKR {totals.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Quantity</span>
                    <span className="font-semibold">
                      {totals.totalQuantity}
                    </span>
                  </div>
                  <div className="border-t-2 border-black pt-4 flex justify-between">
                    <span className="text-xl font-bold text-black">Total</span>
                    <span className="text-2xl font-black text-black">
                      LKR {totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={processingCheckout || cartItems.length === 0}
                  className="w-full bg-black text-white py-4 hover:bg-gray-800 transition-colors font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {processingCheckout ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={24} />
                      Buy Now
                    </>
                  )}
                </button>

                <Link
                  href="/"
                  className="block w-full bg-white text-black border-2 border-black py-3 hover:bg-gray-100 transition-colors font-bold text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
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
                    href="/become-seller"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Become a Seller
                  </Link>
                </li>
                <li>
                  <Link
                    href="/seller-benefits"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Seller Benefits
                  </Link>
                </li>
                <li>
                  <Link
                    href="/seller-faq"
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

export default CartPage;
