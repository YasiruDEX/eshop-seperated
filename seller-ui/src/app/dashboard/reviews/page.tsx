"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function ReviewsPage() {
  const router = useRouter();

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
          <MessageSquare size={32} className="text-black" />
          <h1 className="text-4xl font-black text-black">Reviews</h1>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
          <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-black mb-2">
            Customer Reviews
          </h2>
          <p className="text-gray-600">
            Coming Soon - View and respond to customer reviews here
          </p>
        </div>
      </div>
    </div>
  );
}
