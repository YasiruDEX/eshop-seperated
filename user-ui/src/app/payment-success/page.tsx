"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../shared/context/AuthContext";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const { user } = useAuth();

  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionId && orderId) {
      handlePaymentSuccess();
    } else {
      setError("Invalid payment session");
      setProcessing(false);
    }
  }, [sessionId, orderId]);

  const handlePaymentSuccess = async () => {
    try {
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

      // Call the payment success endpoint
      const response = await fetch(`${GATEWAY_URL}/cart/payment-success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          orderId,
          customerEmail: user?.email || "",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to process payment");
      }

      // Dispatch cart update event to refresh cart count
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error: any) {
      console.error("Error processing payment success:", error);
      setError("Failed to process your order. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-black text-black mb-4">Payment Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/"
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 inline-block font-bold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-grow flex items-center justify-center py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle2
              size={100}
              className="mx-auto text-green-600"
              strokeWidth={2}
            />
          </div>

          {/* Success Message */}
          <h1 className="text-5xl font-black text-black mb-4">
            Order Completed!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your purchase. Your order has been successfully
            placed.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 border-2 border-black p-8 mb-8 text-left">
            <div className="flex items-center gap-3 mb-6">
              <Package size={24} className="text-black" />
              <h2 className="text-2xl font-black text-black">Order Details</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-300 pb-3">
                <span className="text-gray-600 font-semibold">Order ID:</span>
                <span className="text-black font-bold">{orderId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-3">
                <span className="text-gray-600 font-semibold">Status:</span>
                <span className="text-green-600 font-bold">PAID</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">
                  Confirmation Email:
                </span>
                <span className="text-black font-bold">Sent ✓</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-black text-white p-6 mb-8">
            <p className="text-lg">
              📧 A confirmation email has been sent to your email address with
              your order details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors font-bold text-lg flex items-center justify-center gap-3"
            >
              Continue Shopping
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/orders"
              className="bg-white text-black border-2 border-black px-8 py-4 hover:bg-gray-100 transition-colors font-bold text-lg flex items-center justify-center gap-3"
            >
              <Package size={20} />
              View My Orders
            </Link>
          </div>
        </div>
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
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
