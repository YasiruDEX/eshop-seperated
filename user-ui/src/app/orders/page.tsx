"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import { useRouter } from "next/navigation";

interface OrderItem {
  itemId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderId: string;
  userId: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  confirmed: boolean;
  deliveryStatus: string;
  paymentId: string;
  paymentStatus: string;
  customerEmail: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
}

const OrdersPage = () => {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (user?.id) {
      fetchOrders();
    }
  }, [isLoggedIn, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const response = await fetch(`${GATEWAY_URL}/orders/user/${user?.id}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders || []);
      } else {
        setError("Failed to load orders");
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return <Clock className="text-yellow-600" size={20} />;
      case "shipped":
        return <Truck className="text-blue-600" size={20} />;
      case "delivered":
        return <CheckCircle className="text-green-600" size={20} />;
      case "cancelled":
        return <X className="text-red-600" size={20} />;
      default:
        return <Package className="text-gray-600" size={20} />;
    }
  };

  const getDeliveryStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-800";
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track and manage your orders from TitanStore
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-800 p-4 mb-6">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={80} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-black text-black mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping now!
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="border-2 border-black bg-white overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-black text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Package size={24} />
                      <div>
                        <p className="font-bold text-sm">Order ID</p>
                        <p className="text-xs">{order.orderId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">Order Date</p>
                      <p className="text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    {/* Shop Info */}
                    <div className="mb-4 pb-4 border-b-2 border-gray-200">
                      <p className="text-sm text-gray-600">Shop</p>
                      <p className="font-bold text-lg">{order.shopName}</p>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                      <p className="font-bold text-sm mb-3">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                          >
                            <div>
                              <p className="font-semibold">
                                {item.productName}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × LKR{" "}
                                {item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-bold">
                              LKR {item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total and Status */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                      <div className="flex items-center gap-4">
                        {/* Confirmation Status */}
                        <div
                          className={`px-3 py-1 border-2 font-bold text-sm ${
                            order.confirmed
                              ? "bg-green-100 text-green-800 border-green-800"
                              : "bg-gray-100 text-gray-800 border-gray-800"
                          }`}
                        >
                          {order.confirmed
                            ? "✓ Confirmed"
                            : "⏳ Pending Confirmation"}
                        </div>

                        {/* Delivery Status */}
                        <div
                          className={`px-3 py-1 border-2 font-bold text-sm flex items-center gap-2 ${getDeliveryStatusColor(
                            order.deliveryStatus
                          )}`}
                        >
                          {getDeliveryStatusIcon(order.deliveryStatus)}
                          {getDeliveryStatusText(order.deliveryStatus)}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-black text-black">
                          LKR {order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
          </>
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
                <li>
                  <Link href="/offers" className="hover:text-white">
                    Offers
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
                <li>
                  <a href="#" className="hover:text-white">
                    Returns
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

export default OrdersPage;
