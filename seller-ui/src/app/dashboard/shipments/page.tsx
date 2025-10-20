"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, ArrowLeft, Package, RefreshCw, MapPin } from "lucide-react";
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

export default function ShipmentsPage() {
  const router = useRouter();
  const { seller } = useAuth();
  const [shopWebsite, setShopWebsite] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopWebsite = async () => {
      if (!seller?.id) return;

      try {
        const GATEWAY_URL =
          process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        const response = await fetch(
          `${GATEWAY_URL}/api/seller-shop/${seller.id}`
        );
        const data = await response.json();

        if (data.success && data.shop) {
          setShopWebsite(data.shop.website);
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
      }
    };

    fetchShopWebsite();
  }, [seller]);

  useEffect(() => {
    const fetchShipments = async () => {
      if (!shopWebsite) return;

      try {
        setLoading(true);
        const GATEWAY_URL =
          process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        const encodedShopWebsite = encodeURIComponent(shopWebsite);
        const response = await fetch(
          `${GATEWAY_URL}/orders/shop-name/${encodedShopWebsite}`
        );
        const data = await response.json();

        if (data.success && data.data.orders) {
          // Filter only shipped orders
          const shippedOrders = data.data.orders.filter(
            (order: Order) => order.deliveryStatus === "shipped"
          );
          setShipments(shippedOrders);
        }
      } catch (error) {
        console.error("Error fetching shipments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [shopWebsite]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Truck size={32} className="text-black" />
            <div>
              <h1 className="text-4xl font-black text-black">Shipments</h1>
              <p className="text-gray-600">
                Track orders that are currently being shipped
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

        {loading ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
            <RefreshCw
              size={64}
              className="mx-auto mb-4 text-gray-400 animate-spin"
            />
            <p className="text-gray-600">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
            <Truck size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-black mb-2">
              No Active Shipments
            </h2>
            <p className="text-gray-600">
              Orders marked as shipped will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <div
                key={shipment.id}
                className="bg-white border-2 border-gray-200 hover:border-black transition-colors p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-black">
                        Order #{shipment.orderId.slice(-8)}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                        🚚 SHIPPED
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Package size={16} />
                        <span className="font-semibold">Customer:</span>{" "}
                        {shipment.customerName}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span className="font-semibold">Email:</span>{" "}
                        {shipment.customerEmail}
                      </p>
                      <p>
                        <span className="font-semibold">Shipped on:</span>{" "}
                        {formatDate(shipment.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-black">
                      {shipment.currency.toUpperCase()}{" "}
                      {shipment.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      {shipment.paymentStatus.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Items in Shipment:
                  </p>
                  <div className="space-y-2">
                    {shipment.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-800">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {shipment.currency.toUpperCase()}{" "}
                          {item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button
                    onClick={() => router.push("/dashboard/orders")}
                    className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-bold text-sm"
                  >
                    View Full Order Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
