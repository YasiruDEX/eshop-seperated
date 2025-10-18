"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";

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

export default function OrdersPage() {
  const router = useRouter();
  const { seller, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shopName, setShopName] = useState<string | null>(null);

  // Fetch shop name first
  useEffect(() => {
    const fetchShopName = async () => {
      if (!seller?.id) return;

      try {
        const GATEWAY_URL =
          process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        const response = await fetch(
          `${GATEWAY_URL}/api/seller-shop/${seller.id}`
        );
        const data = await response.json();

        if (data.success && data.shop) {
          setShopName(data.shop.name);
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
      }
    };

    if (!authLoading) {
      fetchShopName();
    }
  }, [seller, authLoading]);

  // Fetch orders for the shop by shop name
  useEffect(() => {
    const fetchOrders = async () => {
      if (!shopName) return;

      try {
        setIsLoading(true);
        setError(null);

        const GATEWAY_URL =
          process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        // Encode shop name for URL
        const encodedShopName = encodeURIComponent(shopName);
        const response = await fetch(
          `${GATEWAY_URL}/orders/shop-name/${encodedShopName}`
        );
        const data = await response.json();

        if (data.success) {
          setOrders(data.data.orders);
          setFilteredOrders(data.data.orders);
        } else {
          setError(data.message || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [shopName]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.deliveryStatus === statusFilter
      );
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: { confirmed?: boolean; deliveryStatus?: string }
  ) => {
    try {
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const response = await fetch(`${GATEWAY_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(status),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, ...status } : order
          )
        );
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, ...status });
        }
        alert("Order status updated successfully!");
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return <Clock className="text-yellow-600" size={20} />;
      case "shipped":
        return <Truck className="text-blue-600" size={20} />;
      case "delivered":
        return <CheckCircle className="text-green-600" size={20} />;
      case "cancelled":
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Package className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || (isLoading && !orders.length)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-black hover:text-gray-600 mb-6 font-bold"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBag size={32} className="text-black" />
            <div>
              <h1 className="text-4xl font-black text-black">Orders</h1>
              <p className="text-gray-600">
                Manage and track your shop orders ({orders.length} total)
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border-2 border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="preparing">Preparing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
            <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-black mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No orders match your filters"
                : "No Orders Yet"}
            </h2>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Orders from customers will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border-2 border-gray-200 hover:border-black transition-colors p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-black">
                        {order.orderId}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-bold ${getStatusColor(
                          order.deliveryStatus
                        )}`}
                      >
                        {order.deliveryStatus.toUpperCase()}
                      </span>
                      {!order.confirmed && (
                        <span className="px-3 py-1 text-xs font-bold bg-orange-100 text-orange-800">
                          PENDING CONFIRMATION
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-semibold">Customer:</span>{" "}
                        {order.customerName} ({order.customerEmail})
                      </p>
                      <p>
                        <span className="font-semibold">Items:</span>{" "}
                        {order.items.length} product(s)
                      </p>
                      <p>
                        <span className="font-semibold">Total:</span>{" "}
                        {order.currency.toUpperCase()}{" "}
                        {order.totalAmount.toFixed(2)}
                      </p>
                      <p>
                        <span className="font-semibold">Ordered:</span>{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {!order.confirmed && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order.orderId, {
                            confirmed: true,
                          })
                        }
                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors font-bold"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.confirmed &&
                      order.deliveryStatus === "preparing" && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(order.orderId, {
                              deliveryStatus: "shipped",
                            })
                          }
                          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-bold"
                        >
                          Mark as Shipped
                        </button>
                      )}
                    {order.deliveryStatus === "shipped" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order.orderId, {
                            deliveryStatus: "delivered",
                          })
                        }
                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors font-bold"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-bold"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Order Items:
                  </p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-gray-600 flex justify-between"
                      >
                        <span>
                          {item.productName} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {order.currency.toUpperCase()}{" "}
                          {item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-black">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Order ID and Status */}
              <div>
                <h3 className="font-bold text-black mb-2">Order Information</h3>
                <div className="bg-gray-50 p-4 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Order ID:</span>{" "}
                    {selectedOrder.orderId}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 text-xs font-bold ${getStatusColor(
                        selectedOrder.deliveryStatus
                      )}`}
                    >
                      {selectedOrder.deliveryStatus.toUpperCase()}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Confirmed:</span>{" "}
                    {selectedOrder.confirmed ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="font-semibold">Payment Status:</span>{" "}
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </p>
                  <p>
                    <span className="font-semibold">Payment ID:</span>{" "}
                    {selectedOrder.paymentId}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-bold text-black mb-2">
                  Customer Information
                </h3>
                <div className="bg-gray-50 p-4 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {selectedOrder.customerName}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {selectedOrder.customerEmail}
                  </p>
                  <p>
                    <span className="font-semibold">User ID:</span>{" "}
                    {selectedOrder.userId}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-black mb-2">Order Items</h3>
                <div className="border border-gray-200">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-black">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Item ID: {item.itemId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black">
                            {selectedOrder.currency.toUpperCase()}{" "}
                            {item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Quantity: {item.quantity}</span>
                        <span>
                          Unit Price: {selectedOrder.currency.toUpperCase()}{" "}
                          {item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-black text-white p-4 flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>
                    {selectedOrder.currency.toUpperCase()}{" "}
                    {selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="font-bold text-black mb-2">Timeline</h3>
                <div className="bg-gray-50 p-4 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Created:</span>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Last Updated:</span>{" "}
                    {new Date(selectedOrder.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 px-4 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
