"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import OTPInput from "../../shared/components/OTPInput";
import GoogleIcon from "../../assets/svgs/google-icon";
import { authAPI } from "../../shared/utils/api";

const SignupPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const validateRegistrationForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      otp: "",
      general: "",
    };

    if (!formData.name) {
      newErrors.name = "Name is required";
      isValid = false;
    }

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
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegistrationForm()) return;

    setIsLoading(true);

    try {
      const response = await authAPI.userRegistration({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      console.log("OTP sent:", response);
      setStep("verify");
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otpValue: string) => {
    setOtp(otpValue);
    setIsLoading(true);

    try {
      const response = await authAPI.verifyUser({
        email: formData.email,
        otp: otpValue,
        password: formData.password,
        name: formData.name,
      });
      console.log("User verified:", response);
      // Redirect to login
      router.push("/login");
    } catch (error: any) {
      console.error("Verification error:", error);
      setErrors((prev) => ({
        ...prev,
        otp: "",
        general:
          error.response?.data?.message || "Invalid OTP. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.userRegistration({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      console.log("OTP resent:", response);
      setErrors({ name: "", email: "", password: "", otp: "", general: "" });
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.response?.data?.message || "Failed to resend OTP.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Dummy function for now
    console.log("Google signup clicked");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">signup</h1>
          <p className="text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>{" "}
            . Signup
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {step === "register" ? (
            <>
              <h2 className="text-2xl font-semibold mb-2 text-center">
                Signup to Eshop
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>

              {/* Google Signup */}
              <button
                onClick={handleGoogleSignup}
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

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit}>
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                    {errors.general}
                  </div>
                )}

                <Input
                  label="Name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />

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

                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 mt-2"
                >
                  Continue
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-2 text-center">
                Enter OTP
              </h2>
              <p className="text-center text-gray-600 mb-8">
                We've sent a verification code to {formData.email}
              </p>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                  {errors.general}
                </div>
              )}

              <div className="mb-6">
                <OTPInput
                  length={4}
                  onComplete={handleOTPComplete}
                  error={errors.otp}
                />
              </div>

              <Button
                fullWidth
                isLoading={isLoading}
                onClick={() => otp && handleOTPComplete(otp)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Verify OTP
              </Button>

              <div className="text-center mt-4">
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
