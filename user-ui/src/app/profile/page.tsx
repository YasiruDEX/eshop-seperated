"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Save,
  User,
  DollarSign,
  MapPin,
  Heart,
  ShoppingBag,
  Package,
  Award,
} from "lucide-react";
import { useToast } from "../../shared/hooks/useToast";

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const { success, error: showError, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [location, setLocation] = useState<string>("");

  // Dietary needs
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [dairyFree, setDairyFree] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [lowSodium, setLowSodium] = useState(false);
  const [sugarFree, setSugarFree] = useState(false);
  const [halal, setHalal] = useState(false);
  const [kosher, setKosher] = useState(false);
  const [allergies, setAllergies] = useState<string>("");

  // Brand preferences
  const [preferredBrands, setPreferredBrands] = useState<string>("");
  const [dislikedBrands, setDislikedBrands] = useState<string>("");

  // Household inventory
  const [currentItems, setCurrentItems] = useState<string>("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(2);

  // Loyalty membership
  const [preferredStores, setPreferredStores] = useState<string>("");
  const [memberships, setMemberships] = useState<string>("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (user?.id) {
      fetchProfile();
    }
  }, [isLoggedIn, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const response = await fetch(`${GATEWAY_URL}/profiles/${user?.id}`);
      const data = await response.json();

      if (data.success && data.data) {
        const profile = data.data;
        setBudgetLimit(profile.budget_limit_lkr || 5000);
        setLocation(profile.location || "");

        // Dietary needs
        setVegetarian(profile.dietary_needs?.vegetarian || false);
        setVegan(profile.dietary_needs?.vegan || false);
        setGlutenFree(profile.dietary_needs?.gluten_free || false);
        setDairyFree(profile.dietary_needs?.dairy_free || false);
        setOrganicOnly(profile.dietary_needs?.organic_only || false);
        setLowSodium(profile.dietary_needs?.low_sodium || false);
        setSugarFree(profile.dietary_needs?.sugar_free || false);
        setHalal(profile.dietary_needs?.halal || false);
        setKosher(profile.dietary_needs?.kosher || false);
        setAllergies(profile.dietary_needs?.allergies?.join(", ") || "");

        // Brand preferences
        setPreferredBrands(
          profile.brand_preferences?.preferred_brands?.join(", ") || ""
        );
        setDislikedBrands(
          profile.brand_preferences?.disliked_brands?.join(", ") || ""
        );

        // Household inventory
        if (profile.household_inventory?.current_items) {
          const items = Object.entries(
            profile.household_inventory.current_items
          )
            .map(([key, value]) => `${key}:${value}`)
            .join(", ");
          setCurrentItems(items);
        }
        setLowStockThreshold(
          profile.household_inventory?.low_stock_threshold || 2
        );

        // Loyalty membership
        setPreferredStores(
          profile.loyalty_membership?.preferred_stores?.join(", ") || ""
        );
        if (profile.loyalty_membership?.memberships) {
          const membs = Object.entries(profile.loyalty_membership.memberships)
            .map(([key, value]) => `${key}:${value}`)
            .join(", ");
          setMemberships(membs);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Parse allergies
      const allergiesArray = allergies
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      // Parse brands
      const preferredBrandsArray = preferredBrands
        .split(",")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);
      const dislikedBrandsArray = dislikedBrands
        .split(",")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      // Parse current items
      const currentItemsObj: { [key: string]: number } = {};
      if (currentItems.trim()) {
        currentItems.split(",").forEach((item) => {
          const [key, value] = item.split(":").map((s) => s.trim());
          if (key && value) {
            currentItemsObj[key] = parseInt(value) || 0;
          }
        });
      }

      // Parse stores
      const preferredStoresArray = preferredStores
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Parse memberships
      const membershipsObj: { [key: string]: string } = {};
      if (memberships.trim()) {
        memberships.split(",").forEach((memb) => {
          const [key, value] = memb.split(":").map((s) => s.trim());
          if (key && value) {
            membershipsObj[key] = value;
          }
        });
      }

      const profileData = {
        userId: user?.id,
        budgetLimitLkr: budgetLimit,
        location,
        dietaryNeeds: {
          vegetarian,
          vegan,
          gluten_free: glutenFree,
          dairy_free: dairyFree,
          organic_only: organicOnly,
          low_sodium: lowSodium,
          sugar_free: sugarFree,
          halal,
          kosher,
          allergies: allergiesArray,
        },
        brandPreferences: {
          preferred_brands: preferredBrandsArray,
          disliked_brands: dislikedBrandsArray,
        },
        householdInventory: {
          current_items: currentItemsObj,
          low_stock_threshold: lowStockThreshold,
        },
        loyaltyMembership: {
          preferred_stores: preferredStoresArray,
          memberships: membershipsObj,
        },
      };

      const GATEWAY_URL =
        process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";
      const response = await fetch(`${GATEWAY_URL}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        success("✓ Profile saved successfully!");
      } else {
        showError("Failed to save profile. Please try again.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 border-b-4 border-black pb-6">
          <h1 className="text-4xl font-black text-black mb-2 flex items-center gap-3">
            <User size={40} />
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your shopping preferences and settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Budget & Location */}
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <DollarSign size={24} />
              Budget & Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Budget Limit (LKR)
                </label>
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
                />
              </div>
              <div>
                <label className="flex text-sm font-bold text-black mb-2 items-center gap-2">
                  <MapPin size={16} />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Colombo, Sri Lanka"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Dietary Needs */}
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <Heart size={24} />
              Dietary Needs
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Vegetarian",
                  state: vegetarian,
                  setState: setVegetarian,
                },
                { label: "Vegan", state: vegan, setState: setVegan },
                {
                  label: "Gluten Free",
                  state: glutenFree,
                  setState: setGlutenFree,
                },
                {
                  label: "Dairy Free",
                  state: dairyFree,
                  setState: setDairyFree,
                },
                {
                  label: "Organic Only",
                  state: organicOnly,
                  setState: setOrganicOnly,
                },
                {
                  label: "Low Sodium",
                  state: lowSodium,
                  setState: setLowSodium,
                },
                {
                  label: "Sugar Free",
                  state: sugarFree,
                  setState: setSugarFree,
                },
                { label: "Halal", state: halal, setState: setHalal },
                { label: "Kosher", state: kosher, setState: setKosher },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setState(e.target.checked)}
                    className="w-4 h-4 border-2 border-black"
                  />
                  <span className="text-sm font-semibold">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold text-black mb-2">
                Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g., peanuts, shellfish"
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
              />
            </div>
          </div>

          {/* Brand Preferences */}
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <ShoppingBag size={24} />
              Brand Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Preferred Brands (comma-separated)
                </label>
                <input
                  type="text"
                  value={preferredBrands}
                  onChange={(e) => setPreferredBrands(e.target.value)}
                  placeholder="e.g., Anchor, Maliban, Munchee, MD"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Disliked Brands (comma-separated)
                </label>
                <input
                  type="text"
                  value={dislikedBrands}
                  onChange={(e) => setDislikedBrands(e.target.value)}
                  placeholder="e.g., BrandX"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Household Inventory */}
          <div className="border-2 border-black p-6">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <Package size={24} />
              Household Inventory
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Current Items (format: item:quantity, ...)
                </label>
                <input
                  type="text"
                  value={currentItems}
                  onChange={(e) => setCurrentItems(e.target.value)}
                  placeholder="e.g., rice:5, sugar:3, salt:10"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Loyalty Membership */}
          <div className="border-2 border-black p-6 lg:col-span-2">
            <h2 className="text-2xl font-black text-black mb-4 flex items-center gap-2">
              <Award size={24} />
              Loyalty Membership
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Preferred Stores (comma-separated)
                </label>
                <input
                  type="text"
                  value={preferredStores}
                  onChange={(e) => setPreferredStores(e.target.value)}
                  placeholder="e.g., glowmark.lk, kapruka.com"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Memberships (format: store:tier, ...)
                </label>
                <input
                  type="text"
                  value={memberships}
                  onChange={(e) => setMemberships(e.target.value)}
                  placeholder="e.g., glowmark.lk:gold, kapruka.com:premium"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-black text-white px-8 py-4 font-black text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-2 border-black"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin"></div>
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
      </div>
    </div>
  );
}
