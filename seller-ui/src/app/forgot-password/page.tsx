"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { OTPInput } from "@/shared/components/OTPInput";
import { sellerAPI } from "@/shared/utils/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await sellerAPI.forgotPassword({ email });
      setStep(2);
      startResendTimer();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setError("");
    setIsLoading(true);

    try {
      await sellerAPI.verifyForgotPasswordOTP({ email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setError("");
    setIsLoading(true);

    try {
      await sellerAPI.forgotPassword({ email });
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await sellerAPI.resetPassword({ email, newPassword });
      router.push("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-6">
              Forgot Password
            </h2>
            <p className="text-center text-sm text-gray-600 mb-8">
              Enter your email address and we'll send you an OTP to reset your
              password.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" isLoading={isLoading}>
                Send OTP
              </Button>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-6">Enter OTP</h2>
            <p className="text-center text-sm text-gray-600 mb-8">
              We've sent a 4-digit code to {email}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="mb-8">
              <OTPInput
                length={4}
                onComplete={handleOTPComplete}
                error={error}
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
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-6">
              Reset Password
            </h2>
            <p className="text-center text-sm text-gray-600 mb-8">
              Enter your new password below.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <Input
                label="New Password"
                isPassword
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />

              <Button type="submit" isLoading={isLoading}>
                Reset Password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
