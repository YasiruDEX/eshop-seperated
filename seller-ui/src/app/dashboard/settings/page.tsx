"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowLeft, Save, Loader } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";

interface ShopData {
  id?: string;
  name: string;
  bio: string;
  address: string;
  opening_hours: string;
  website: string;
  category: string;
  coverBanner: string;
  socialLinks: Array<{ platform: string; url: string }>;
}

interface SellerData {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [sellerData, setSellerData] = useState<SellerData>({
    id: "",
    name: "",
    email: "",
    phone_number: "",
    country: "",
  });

  const [shopData, setShopData] = useState<ShopData>({
    name: "",
    bio: "",
    address: "",
    opening_hours: "",
    website: "",
    category: "",
    coverBanner: "",
    socialLinks: [],
  });

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    } else if (isLoggedIn && user?.id) {
      fetchShopDetails();
    }
  }, [authLoading, isLoggedIn, user, router]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/seller-shop/${user?.id}`
      );
      const data = await response.json();

      if (data.success) {
        setSellerData(data.seller);
        if (data.shop) {
          setShopData({
            id: data.shop.id,
            name: data.shop.name || "",
            bio: data.shop.bio || "",
            address: data.shop.address || "",
            opening_hours: data.shop.opening_hours || "",
            website: data.shop.website || "",
            category: data.shop.category || "",
            coverBanner: data.shop.coverBanner || "",
            socialLinks: data.shop.socialLinks || [],
          });
        }
      }
    } catch (err) {
      console.error("Error fetching shop details:", err);
      setError("Failed to load shop details");
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShopData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSellerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSellerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveShop = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:8080/api/seller-shop/${user?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shopName: shopData.name,
            bio: shopData.bio,
            address: shopData.address,
            opening_hours: shopData.opening_hours,
            website: shopData.website,
            category: shopData.category,
            coverBanner: shopData.coverBanner,
            socialLinks: shopData.socialLinks,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Shop details updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update shop details");
      }
    } catch (err) {
      console.error("Error updating shop:", err);
      setError("Failed to update shop details");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:8080/api/seller-profile/${user?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: sellerData.name,
            phone_number: sellerData.phone_number,
            country: sellerData.country,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
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
        <div className="flex items-center gap-3 mb-8">
          <Store size={32} className="text-black" />
          <h1 className="text-4xl font-black text-black">Store Settings</h1>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg text-green-700 font-semibold">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700 font-semibold">
            {error}
          </div>
        )}

        {/* Seller Profile Section */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-black text-black mb-6">
            Seller Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={sellerData.name}
                onChange={handleSellerChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={sellerData.email}
                disabled
                className="w-full px-4 py-2 border-2 border-gray-200 rounded bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={sellerData.phone_number}
                onChange={handleSellerChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={sellerData.country}
                onChange={handleSellerChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="mt-6 bg-black text-white px-6 py-3 rounded font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Profile
              </>
            )}
          </button>
        </div>

        {/* Shop Details Section */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-black text-black mb-6">
            Shop Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Shop Name *
              </label>
              <input
                type="text"
                name="name"
                value={shopData.name}
                onChange={handleShopChange}
                placeholder="Enter shop name"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={shopData.category}
                onChange={handleShopChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Toys">Toys</option>
                <option value="Beauty">Beauty</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={shopData.bio}
                onChange={handleShopChange}
                placeholder="Tell customers about your shop"
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={shopData.address}
                onChange={handleShopChange}
                placeholder="Enter shop address"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Opening Hours
              </label>
              <input
                type="text"
                name="opening_hours"
                value={shopData.opening_hours}
                onChange={handleShopChange}
                placeholder="e.g., Mon-Fri 9AM-6PM"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={shopData.website}
                onChange={handleShopChange}
                placeholder="https://yourshop.com"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Cover Banner URL
              </label>
              <input
                type="url"
                name="coverBanner"
                value={shopData.coverBanner}
                onChange={handleShopChange}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            onClick={handleSaveShop}
            disabled={saving || !shopData.name || !shopData.address}
            className="mt-6 bg-black text-white px-6 py-3 rounded font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Shop Details
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
