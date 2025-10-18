"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import GoogleIcon from "../../assets/svgs/google-icon";
import { authAPI } from "../../shared/utils/api";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "", general: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authAPI.loginUser(formData);
      console.log("Login successful:", response);

      // Store user data in localStorage
      if (response.user) {
        const userData = {
          id: response.user.id || response.user._id,
          name: response.user.name,
          email: response.user.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      // Redirect to home or dashboard
      router.push("/");
      window.location.reload(); // Reload to update auth context
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.response?.data?.message || "Invalid email or password",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Dummy function for now
    console.log("Google login clicked");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Login</h1>
          <p className="text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>{" "}
            . Login
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-2 text-center">
            Login to Eshop
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 rounded-md py-3 mb-6 hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            <span className="font-medium">Sign in with Google</span>
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">
              or Sign in with Email
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {errors.general}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="shahriar@becodemy.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="text-right mb-4">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-black hover:bg-gray-800"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
