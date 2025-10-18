"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { sellerAPI } from "@/shared/utils/api";
import { useAuth } from "../../shared/context/AuthContext";
import Link from "next/link";

export default function SellerLoginPage() {
  const router = useRouter();
  const { setSeller, setIsAuthenticated, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await sellerAPI.login(formData);

      // Store seller data in auth context and localStorage
      if (response.seller) {
        const sellerData = response.seller;
        setSeller(sellerData);
        setIsAuthenticated(true);
        localStorage.setItem("seller", JSON.stringify(sellerData));

        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Login</h1>
          <p className="text-gray-600">Home › Login</p>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Login to Eshop</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="text-center text-sm text-gray-500 mb-6">
          or Sign in with Email
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="programmershahriarsajeeb@gmail.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            isPassword
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading}>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
