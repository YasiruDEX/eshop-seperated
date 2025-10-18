"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import OTPInput from "../../shared/components/OTPInput";
import { authAPI } from "../../shared/utils/api";

type Step = "email" | "otp" | "reset";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      general: "",
    };

    if (!email) {
      newErrors.email = "Email is required";
      setErrors(newErrors);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      console.log("OTP sent:", response);
      setStep("otp");
      setErrors({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
        general: "",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otpValue: string) => {
    setOtp(otpValue);
    setIsLoading(true);

    try {
      const response = await authAPI.verifyForgotPassword({
        email,
        otp: otpValue,
      });
      console.log("OTP verified:", response);
      setStep("reset");
      setErrors({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
        general: "",
      });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          error.response?.data?.message || "Invalid OTP. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      general: "",
    };

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (newErrors.newPassword || newErrors.confirmPassword) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email,
        newPassword,
      });
      console.log("Password reset successful:", response);
      // Redirect to login
      router.push("/login");
    } catch (error: any) {
      console.error("Reset password error:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          error.response?.data?.message ||
          "Failed to reset password. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email });
      console.log("OTP resent:", response);
      setErrors({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
        general: "",
      });
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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Forgot Password</h1>
          <p className="text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>{" "}
            . Forgot-password
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {step === "email" && (
            <>
              <h2 className="text-2xl font-semibold mb-2 text-center">
                Login to Eshop
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Go back to?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>

              <form onSubmit={handleEmailSubmit}>
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "", general: "" }));
                  }}
                  error={errors.email}
                />

                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  className="bg-black hover:bg-gray-800"
                >
                  Submit
                </Button>
              </form>

              {errors.general && (
                <p className="text-red-500 text-sm text-center mt-3">
                  Invalid email or password
                </p>
              )}
            </>
          )}

          {step === "otp" && (
            <>
              <h2 className="text-2xl font-semibold mb-2 text-center">
                Enter OTP
              </h2>
              <p className="text-center text-gray-600 mb-8">
                We've sent a verification code to {email}
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
                className="bg-black hover:bg-gray-800"
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

          {step === "reset" && (
            <>
              <h2 className="text-2xl font-semibold mb-2 text-center">
                Reset Password
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Enter your new password
              </p>

              <form onSubmit={handleResetPassword}>
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                    {errors.general}
                  </div>
                )}

                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      newPassword: "",
                      general: "",
                    }));
                  }}
                  error={errors.newPassword}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                      general: "",
                    }));
                  }}
                  error={errors.confirmPassword}
                />

                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  className="bg-black hover:bg-gray-800"
                >
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
