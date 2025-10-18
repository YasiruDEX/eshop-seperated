"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressStepper } from "@/shared/components/ProgressStepper";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Select } from "@/shared/components/Select";
import { OTPInput } from "@/shared/components/OTPInput";
import { sellerAPI } from "@/shared/utils/api";
import { COUNTRIES, SHOP_CATEGORIES } from "@/shared/utils/constants";
import Link from "next/link";

const STEPS = [
  { label: "Create Account", number: 1 },
  { label: "Setup Shop", number: 2 },
  { label: "Connect Bank", number: 3 },
];

interface SellerData {
  name: string;
  email: string;
  phone_number: string;
  country: string;
  password: string;
}

interface ShopData {
  name: string;
  bio: string;
  address: string;
  opening_hours: string;
  website: string;
  category: string;
}

export default function SellerRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const [sellerData, setSellerData] = useState<SellerData>({
    name: "",
    email: "",
    phone_number: "",
    country: "",
    password: "",
  });

  const [shopData, setShopData] = useState<ShopData>({
    name: "",
    bio: "",
    address: "",
    opening_hours: "",
    website: "",
    category: "",
  });

  const [sellerId, setSellerId] = useState("");

  // Step 1: Create Account
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await sellerAPI.register(sellerData);
      setShowOTPModal(true);
      startResendTimer();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setOtpError("");
    setIsLoading(true);

    try {
      const response = await sellerAPI.verifyOTP({
        ...sellerData,
        otp,
      });
      setSellerId(response.seller.id);
      setShowOTPModal(false);
      setCurrentStep(2);
    } catch (err: any) {
      setOtpError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(32);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setOtpError("");
    setIsLoading(true);

    try {
      await sellerAPI.register(sellerData);
      startResendTimer();
    } catch (err: any) {
      setOtpError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Setup Shop
  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await sellerAPI.createShop({
        ...shopData,
        sellerId,
      });
      setCurrentStep(3);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to create shop. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Connect Stripe
  const handleStripeConnect = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await sellerAPI.createStripeLink({ sellerId });
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to connect Stripe. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressStepper steps={STEPS} currentStep={currentStep} />

        {/* Step 1: Create Account */}
        {currentStep === 1 && !showOTPModal && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Create Account
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <Input
                label="Name"
                placeholder="shahriar"
                value={sellerData.name}
                onChange={(e) =>
                  setSellerData({ ...sellerData, name: e.target.value })
                }
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="programmershahriarsajeeb@gmail.com"
                value={sellerData.email}
                onChange={(e) =>
                  setSellerData({ ...sellerData, email: e.target.value })
                }
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="880178583****"
                value={sellerData.phone_number}
                onChange={(e) =>
                  setSellerData({ ...sellerData, phone_number: e.target.value })
                }
                required
              />

              <Select
                label="Country"
                options={COUNTRIES}
                value={sellerData.country}
                onChange={(e) =>
                  setSellerData({ ...sellerData, country: e.target.value })
                }
                required
              />

              <Input
                label="Password"
                isPassword
                placeholder="••••••••"
                value={sellerData.password}
                onChange={(e) =>
                  setSellerData({ ...sellerData, password: e.target.value })
                }
                required
              />

              <Button type="submit" isLoading={isLoading}>
                Signup
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        )}

        {/* OTP Modal */}
        {showOTPModal && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Enter OTP</h2>

            <div className="mb-8">
              <OTPInput
                length={4}
                onComplete={handleOTPComplete}
                error={otpError}
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Setup Shop */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Setup new shop
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleShopSubmit} className="space-y-5">
              <Input
                label="Name"
                placeholder="Becodemy"
                value={shopData.name}
                onChange={(e) =>
                  setShopData({ ...shopData, name: e.target.value })
                }
                required
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio (Max 100 words) <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="You will get anything related to programming"
                  value={shopData.bio}
                  onChange={(e) =>
                    setShopData({ ...shopData, bio: e.target.value })
                  }
                  required
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <Input
                label="Address"
                placeholder="shop location"
                value={shopData.address}
                onChange={(e) =>
                  setShopData({ ...shopData, address: e.target.value })
                }
                required
              />

              <Input
                label="Opening Hours"
                placeholder="e.g., Mon-Fri 9AM - 6PM"
                value={shopData.opening_hours}
                onChange={(e) =>
                  setShopData({ ...shopData, opening_hours: e.target.value })
                }
                required
              />

              <Input
                label="Website"
                type="url"
                placeholder="https://example.com"
                value={shopData.website}
                onChange={(e) =>
                  setShopData({ ...shopData, website: e.target.value })
                }
              />

              <Select
                label="Category"
                options={SHOP_CATEGORIES}
                value={shopData.category}
                onChange={(e) =>
                  setShopData({ ...shopData, category: e.target.value })
                }
                required
              />

              <Button type="submit" isLoading={isLoading}>
                Create
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: Connect Bank */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              Withdraw Method
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleStripeConnect}
              isLoading={isLoading}
              variant="secondary"
            >
              Connect Stripe 💳
            </Button>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
