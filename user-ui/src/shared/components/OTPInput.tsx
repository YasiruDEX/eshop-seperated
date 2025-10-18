"use client";

import React, { useRef, useState, KeyboardEvent } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  onComplete,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    setOtp([...newOtp, ...Array(length - newOtp.length).fill("")]);

    if (newOtp.length === length) {
      onComplete(newOtp.join(""));
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center gap-3 mb-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-14 h-14 text-center text-2xl font-semibold border-2 rounded-lg outline-none transition-colors ${
              error
                ? "border-red-500"
                : digit
                ? "border-blue-500"
                : "border-gray-300"
            } focus:border-blue-500`}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
    </div>
  );
};

export default OTPInput;
