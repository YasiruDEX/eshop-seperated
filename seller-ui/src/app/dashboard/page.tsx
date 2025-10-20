"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../shared/context/AuthContext";
import {
  LayoutGrid,
  Package,
  Users,
  ShoppingBag,
  Truck,
  Store,
  MessageSquare,
  HelpCircle,
  LogOut,
  Search,
  Receipt,
  Settings as SettingsIcon,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";

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

interface DashboardStats {
  avgOrderValue: number;
  totalOrders: number;
  totalRevenue: number;
  revenueChange: number;
  ordersChange: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, loading } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = React.useState("overview");
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [shopWebsite, setShopWebsite] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    avgOrderValue: 0,
    totalOrders: 0,
    totalRevenue: 0,
    revenueChange: 0,
    ordersChange: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  // Fetch shop website
  useEffect(() => {
    const fetchShopWebsite = async () => {
      if (!user?.id) return;

      try {
        const GATEWAY_URL =
          process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        const response = await fetch(
          `${GATEWAY_URL}/api/seller-shop/${user.id}`
        );
        const data = await response.json();

        if (data.success && data.shop) {
          setShopWebsite(data.shop.website);
        }
      } catch (error) {
        console.error("Error fetching shop:", error);
      }
    };

    if (!loading && isLoggedIn) {
      fetchShopWebsite();
    }
  }, [user, loading, isLoggedIn]);

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      if (!shopWebsite) return;

      try {
        setLoadingData(true);
        const GATEWAY_URL =
          process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
        const encodedShopWebsite = encodeURIComponent(shopWebsite);
        const response = await fetch(
          `${GATEWAY_URL}/orders/shop-name/${encodedShopWebsite}`
        );
        const data = await response.json();

        if (data.success && data.data.orders) {
          const fetchedOrders = data.data.orders;
          setOrders(fetchedOrders);
          calculateStats(fetchedOrders);
          calculateMonthlyData(fetchedOrders);
          calculateTopProducts(fetchedOrders);
          setRecentOrders(fetchedOrders.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchOrders();
  }, [shopWebsite]);

  const calculateStats = (ordersData: Order[]) => {
    const totalRevenue = ordersData.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalOrders = ordersData.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentOrders = ordersData.filter(
      (order) => new Date(order.createdAt) >= thirtyDaysAgo
    );
    const previousOrders = ordersData.filter(
      (order) =>
        new Date(order.createdAt) >= sixtyDaysAgo &&
        new Date(order.createdAt) < thirtyDaysAgo
    );

    const recentRevenue = recentOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const revenueChange =
      previousRevenue > 0
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;
    const ordersChange =
      previousOrders.length > 0
        ? ((recentOrders.length - previousOrders.length) /
            previousOrders.length) *
          100
        : 0;

    setStats({
      avgOrderValue,
      totalOrders,
      totalRevenue,
      revenueChange,
      ordersChange,
    });
  };

  const calculateMonthlyData = (ordersData: Order[]) => {
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get last 8 months
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = monthNames[date.getMonth()];
      monthlyMap.set(monthKey, { revenue: 0, orders: 0 });
    }

    // Aggregate orders by month
    ordersData.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      const existing = monthlyMap.get(monthKey);
      if (existing) {
        existing.revenue += order.totalAmount;
        existing.orders += 1;
      }
    });

    // Convert to array
    const data: MonthlyData[] = [];
    let monthIndex = 0;
    monthlyMap.forEach((value, key) => {
      const [year, month] = key.split("-").map(Number);
      data.push({
        month: monthNames[month],
        revenue: value.revenue,
        orders: value.orders,
      });
      monthIndex++;
    });

    setMonthlyData(data);
  };

  const calculateTopProducts = (ordersData: Order[]) => {
    const productMap = new Map<
      string,
      { totalQuantity: number; totalRevenue: number }
    >();

    ordersData.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(item.productName);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.totalPrice;
        } else {
          productMap.set(item.productName, {
            totalQuantity: item.quantity,
            totalRevenue: item.totalPrice,
          });
        }
      });
    });

    // Sort by quantity and get top 5
    const sorted = Array.from(productMap.entries())
      .map(([productName, data]) => ({
        productName,
        ...data,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    setTopProducts(sorted);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "preparing":
        return "text-yellow-600 bg-yellow-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...monthlyData.map((d) => d.orders), 1);

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customer", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "shipments", label: "Shipment", icon: Truck },
    { id: "settings", label: "Store Setting", icon: Store },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMenuClick = (menuId: string) => {
    setActiveMenuItem(menuId);
    if (menuId !== "overview") {
      router.push(`/dashboard/${menuId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Store size={28} />
            TitanSeller
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? "bg-white text-black font-bold"
                    : "text-gray-300 hover:bg-gray-900"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Help & Support */}
        <div className="border-t border-gray-800 p-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-900 rounded">
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </button>
        </div>

        {/* Upgrade Pro Card */}
        {/* <div className="p-6">
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-black" />
            </div>
            <h3 className="font-bold mb-2">Upgrade Pro</h3>
            <p className="text-xs text-gray-400 mb-4">
              Discover new features for detailed report and analysis
            </p>
            <button className="w-full bg-white text-black py-2 rounded font-bold text-sm hover:bg-gray-200 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Profile Section */}
            <div className="relative ml-6">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">{user?.name || "Seller"}</p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "seller@titanstore.com"}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="font-semibold">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-black mb-2">
              Welcome back, {user?.name || "Seller"}!
            </h1>
            <p className="text-gray-600">Here's Your Current Sales Overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Avg Order Value */}
            <div className="bg-black text-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-300 text-sm">AVG. Order Value</p>
                <Receipt className="text-gray-400" size={24} />
              </div>
              <p className="text-4xl font-black mb-2">
                {loadingData ? (
                  <RefreshCw className="animate-spin" size={32} />
                ) : (
                  `LKR ${stats.avgOrderValue.toFixed(2)}`
                )}
              </p>
              <p
                className={`text-sm ${
                  stats.revenueChange >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stats.revenueChange >= 0 ? "+" : ""}
                {stats.revenueChange.toFixed(2)}%{" "}
                <span className="text-gray-400">From last month</span>
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <ShoppingCart className="text-gray-400" size={24} />
              </div>
              <p className="text-4xl font-black mb-2 text-black">
                {loadingData ? (
                  <RefreshCw className="animate-spin" size={32} />
                ) : (
                  stats.totalOrders.toLocaleString()
                )}
              </p>
              <p
                className={`text-sm ${
                  stats.ordersChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stats.ordersChange >= 0 ? "+" : ""}
                {stats.ordersChange.toFixed(2)}%{" "}
                <span className="text-gray-500">From last month</span>
              </p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <DollarSign className="text-gray-400" size={24} />
              </div>
              <p className="text-4xl font-black mb-2 text-black">
                {loadingData ? (
                  <RefreshCw className="animate-spin" size={32} />
                ) : (
                  `LKR ${stats.totalRevenue.toLocaleString()}`
                )}
              </p>
              <p
                className={`text-sm ${
                  stats.revenueChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stats.revenueChange >= 0 ? "+" : ""}
                {stats.revenueChange.toFixed(2)}%{" "}
                <span className="text-gray-500">From last month</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black">Sales Overtime</h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Order</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px] flex items-end justify-between gap-2 px-4">
                {loadingData ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <RefreshCw className="animate-spin" size={48} />
                  </div>
                ) : monthlyData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                ) : (
                  monthlyData.map((data, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="relative w-full h-[250px] flex items-end gap-1">
                        <div
                          className="flex-1 bg-purple-500 rounded-t"
                          style={{
                            height: `${(data.revenue / maxRevenue) * 100}%`,
                          }}
                          title={`Revenue: LKR ${data.revenue.toLocaleString()}`}
                        />
                        <div
                          className="flex-1 bg-blue-500 rounded-t"
                          style={{
                            height: `${(data.orders / maxOrders) * 100}%`,
                          }}
                          title={`Orders: ${data.orders}`}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-semibold">
                        {data.month}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black">Top Selling Product</h2>
                <button
                  onClick={() => router.push("/dashboard/products")}
                  className="text-sm text-black font-semibold hover:underline"
                >
                  See All Product
                </button>
              </div>
              <div className="space-y-4">
                {loadingData ? (
                  <div className="text-center py-8">
                    <RefreshCw className="animate-spin mx-auto" size={32} />
                  </div>
                ) : topProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No products available
                  </div>
                ) : (
                  topProducts.map((product, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Package className="text-gray-500" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-black truncate">
                          {product.productName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {product.totalQuantity} Units Sold
                        </p>
                      </div>
                      <span className="text-xs text-green-600 font-semibold whitespace-nowrap">
                        LKR {product.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Latest Orders */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">Latest Orders</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded hover:bg-gray-50">
                  Customize
                </button>
                <button className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded hover:bg-gray-50">
                  Filter
                </button>
                <button className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded hover:bg-gray-50">
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
                      Order Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
                      Payment
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <RefreshCw className="animate-spin mx-auto" size={32} />
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-400"
                      >
                        No orders available
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4 font-semibold text-sm">
                          #{order.orderId.slice(-8)}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {order.items.length > 0
                            ? order.items[0].productName
                            : "N/A"}
                          {order.items.length > 1 && (
                            <span className="text-gray-500">
                              {" "}
                              +{order.items.length - 1} more
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 px-4 font-bold text-sm">
                          {order.currency.toUpperCase()}{" "}
                          {order.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-sm capitalize">
                          {order.paymentStatus}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                              order.deliveryStatus
                            )}`}
                          >
                            {order.deliveryStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() =>
                              router.push("/dashboard/orders")
                            }
                            className="text-gray-400 hover:text-black"
                          >
                            <SettingsIcon size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
