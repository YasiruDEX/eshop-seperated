"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ArrowLeft,
  Plus,
  Search,
  X,
  DollarSign,
  Image as ImageIcon,
  Link as LinkIcon,
  Globe,
} from "lucide-react";
import { catalogueAPI, sellerAPI } from "@/shared/utils/api";
import { useAuth } from "@/shared/context/AuthContext";

interface Product {
  id: string;
  title: string;
  price_LKR: number;
  currency: string;
  image_url?: string;
  source_url?: string;
  website?: string;
  source_domain?: string;
  created_at?: Date;
  last_updated?: Date;
}

export default function ProductsPage() {
  const router = useRouter();
  const { seller } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shopWebsite, setShopWebsite] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    price_LKR: "",
    image_url: "",
    currency: "LKR",
    source_url: "",
    website: "",
    source_domain: "",
  });

  const [formErrors, setFormErrors] = useState({
    title: "",
    price_LKR: "",
  });

  // Fetch seller's shop info on mount
  useEffect(() => {
    if (seller?.id) {
      fetchShopInfo();
    }
  }, [seller]);

  // Fetch products when shop website is loaded
  useEffect(() => {
    if (shopWebsite) {
      fetchProducts();
    }
  }, [shopWebsite]);

  const fetchShopInfo = async () => {
    try {
      if (!seller?.id) return;
      const response = await sellerAPI.getSellerShop(seller.id);
      if (response.success && response.data?.website) {
        setShopWebsite(response.data.website);
      }
    } catch (err: any) {
      console.error("Error fetching shop info:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      if (!shopWebsite) {
        setError("Please set up your shop website first in Store Settings");
        setProducts([]);
        setIsLoading(false);
        return;
      }

      // Filter products by the seller's shop website
      const response = await catalogueAPI.filterProducts({
        website: shopWebsite,
        limit: 100,
      });

      setProducts(response.data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }

    if (!shopWebsite) {
      setError("Please set up your shop website first in Store Settings");
      return;
    }

    try {
      setIsLoading(true);
      // Search with website filter
      const response = await catalogueAPI.filterProducts({
        website: shopWebsite,
        searchTerm: searchTerm,
        limit: 100,
      });
      setProducts(response.data || []);
    } catch (err: any) {
      console.error("Error searching products:", err);
      setError("Failed to search products");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {
      title: "",
      price_LKR: "",
    };

    if (!formData.title.trim()) {
      errors.title = "Product title is required";
    }

    if (!formData.price_LKR || Number(formData.price_LKR) <= 0) {
      errors.price_LKR = "Valid price is required";
    }

    setFormErrors(errors);
    return !errors.title && !errors.price_LKR;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    if (!shopWebsite) {
      setError("Please set up your shop website first in Store Settings");
      return;
    }

    try {
      const productData = {
        title: formData.title,
        price_LKR: Number(formData.price_LKR),
        image_url: formData.image_url || undefined,
        currency: formData.currency,
        source_url: formData.source_url || undefined,
        website: shopWebsite, // Automatically set to seller's shop website
        source_domain: formData.source_domain || undefined,
      };

      const response = await catalogueAPI.addProduct(productData);

      if (response.success) {
        setSuccess("Product added successfully!");
        setShowAddModal(false);
        setFormData({
          title: "",
          price_LKR: "",
          image_url: "",
          currency: "LKR",
          source_url: "",
          website: "",
          source_domain: "",
        });
        fetchProducts(); // Refresh the list
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      console.error("Error adding product:", err);
      setError(
        err.response?.data?.error || "Failed to add product. Please try again."
      );
    }
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package size={32} className="text-black" />
            <div>
              <h1 className="text-4xl font-black text-black">Products</h1>
              {shopWebsite && (
                <p className="text-sm text-gray-600 mt-1">
                  <Globe size={14} className="inline mr-1" />
                  Store: {shopWebsite}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!shopWebsite}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
              shopWebsite
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={!shopWebsite ? "Please set up your shop website first" : ""}
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  fetchProducts();
                }}
                className="bg-gray-200 text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
            <Package size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-black mb-2">
              No Products Found
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "No products match your search. Try different keywords."
                : "Start by adding your first product to the catalogue"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).parentElement!.innerHTML =
                          '<div class="text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                      }}
                    />
                  ) : (
                    <ImageIcon size={64} className="text-gray-400" />
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-black line-clamp-2">
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={18} className="text-green-600" />
                    <span className="text-2xl font-black text-black">
                      {product.price_LKR.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {product.currency}
                    </span>
                  </div>

                  {product.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Globe size={14} />
                      <span className="truncate">{product.website}</span>
                    </div>
                  )}

                  {product.source_url && (
                    <a
                      href={product.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <LinkIcon size={14} />
                      <span className="truncate">View Source</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-black">
                Add New Product
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-4 py-3 border ${
                    formErrors.title ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:border-black`}
                  placeholder="Enter product title"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Price and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Price (LKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_LKR}
                    onChange={(e) =>
                      setFormData({ ...formData, price_LKR: e.target.value })
                    }
                    className={`w-full px-4 py-3 border ${
                      formErrors.price_LKR
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:outline-none focus:border-black`}
                    placeholder="0.00"
                  />
                  {formErrors.price_LKR && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.price_LKR}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  >
                    <option value="LKR">LKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Source URL */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Product Source URL
                </label>
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) =>
                    setFormData({ ...formData, source_url: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="https://example.com/product"
                />
              </div>

              {/* Source Domain */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Source Domain
                </label>
                <input
                  type="text"
                  value={formData.source_domain}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      source_domain: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="example.com"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-bold text-black hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
