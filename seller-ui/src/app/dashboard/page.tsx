"use client";

import React, { useEffect } from "react";
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
} from "lucide-react";

// Dummy sales data (in LKR)
const salesData = [
  { month: "Jun", revenue: 3750000, orders: 85 },
  { month: "Jul", revenue: 4560000, orders: 102 },
  { month: "Aug", revenue: 5670000, orders: 128 },
  { month: "Sep", revenue: 5010000, orders: 115 },
  { month: "Oct", revenue: 6390000, orders: 145 },
  { month: "Nov", revenue: 5940000, orders: 132 },
  { month: "Dec", revenue: 7350000, orders: 168 },
  { month: "Jan", revenue: 6630000, orders: 151 },
];

// Dummy top products (Sri Lankan products)
const topProducts = [
  {
    id: 1,
    name: "Maliban Cream Cracker 500g",
    stock: "12,459 Units",
    remaining: "435 Stocks Remaining",
    available: true,
  },
  {
    id: 2,
    name: "Anchor Full Cream Milk Powder 1kg",
    stock: "8,542 Units",
    remaining: "278 Stocks Remaining",
    available: true,
  },
  {
    id: 3,
    name: "MD Ceylon Tea 200g",
    stock: "6,456 Units",
    remaining: "405 Stocks Remaining",
    available: true,
  },
];

// Dummy recent orders (LKR currency)
const recentOrders = [
  {
    id: "#2456JL",
    product: "Keells Basmati Rice 5kg",
    date: "Jan 12, 12:23 pm",
    price: "LKR 2,450.00",
    payment: "Transfer",
    status: "Processing",
    statusColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "#5433DF",
    product: "Maliban Gold Marie Biscuits",
    date: "May 01, 01:13 pm",
    price: "LKR 340.00",
    payment: "Credit Card",
    status: "Completed",
    statusColor: "text-green-600 bg-green-50",
  },
  {
    id: "#9876XC",
    product: "Anchor Butter 200g",
    date: "Sep 20, 09:08 am",
    price: "LKR 1,280.00",
    payment: "Transfer",
    status: "Completed",
    statusColor: "text-green-600 bg-green-50",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, loading } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = React.useState("overview");
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

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
              <p className="text-4xl font-black mb-2">LKR 23,165</p>
              <p className="text-sm text-green-400">
                + 2.18% <span className="text-gray-400">From last month</span>
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 text-sm">Total Orders</p>
                <ShoppingCart className="text-gray-400" size={24} />
              </div>
              <p className="text-4xl font-black mb-2 text-black">2,107</p>
              <p className="text-sm text-red-500">
                - 1.13% <span className="text-gray-500">From last month</span>
              </p>
            </div>

            {/* Lifetime Value */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 text-sm">Lifetime Value</p>
                <DollarSign className="text-gray-400" size={24} />
              </div>
              <p className="text-4xl font-black mb-2 text-black">LKR 195,900</p>
              <p className="text-sm text-green-500">
                + 2.24% <span className="text-gray-500">From last month</span>
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
                {salesData.map((data, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="relative w-full h-[250px] flex items-end gap-1">
                      <div
                        className="flex-1 bg-purple-500 rounded-t"
                        style={{ height: `${data.revenue / 75000}%` }}
                        title={`Revenue: LKR ${data.revenue.toLocaleString()}`}
                      />
                      <div
                        className="flex-1 bg-blue-500 rounded-t"
                        style={{ height: `${data.orders / 2}%` }}
                        title={`Orders: ${data.orders}`}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-semibold">
                      {data.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black">Top Selling Product</h2>
                <button className="text-sm text-black font-semibold hover:underline">
                  See All Product
                </button>
              </div>
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-black truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">{product.stock}</p>
                    </div>
                    <span className="text-xs text-green-600 font-semibold whitespace-nowrap">
                      Available
                    </span>
                  </div>
                ))}
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
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4 font-semibold text-sm">
                        {order.id}
                      </td>
                      <td className="py-4 px-4 text-sm">{order.product}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {order.date}
                      </td>
                      <td className="py-4 px-4 font-bold text-sm">
                        {order.price}
                      </td>
                      <td className="py-4 px-4 text-sm">{order.payment}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${order.statusColor}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-gray-400 hover:text-black">
                          <SettingsIcon size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
