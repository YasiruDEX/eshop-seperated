"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-600" size={24} />;
      case "error":
        return <AlertCircle className="text-red-600" size={24} />;
      case "info":
        return <Info className="text-blue-600" size={24} />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-600";
      case "error":
        return "bg-red-50 border-red-600";
      case "info":
        return "bg-blue-50 border-blue-600";
      default:
        return "bg-gray-50 border-gray-600";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-900";
      case "error":
        return "text-red-900";
      case "info":
        return "text-blue-900";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 transform transition-all duration-300 ease-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 p-4 border-2 shadow-lg min-w-[300px] max-w-md ${getBackgroundColor()}`}
      >
        {getIcon()}
        <p className={`flex-1 font-semibold ${getTextColor()}`}>{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
