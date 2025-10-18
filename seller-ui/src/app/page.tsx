"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../shared/context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isLoggedIn, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );
}
