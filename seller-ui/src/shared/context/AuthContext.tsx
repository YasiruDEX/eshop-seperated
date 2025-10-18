"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { sellerAPI } from "../utils/api";

interface Seller {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country: string;
}

interface AuthContextType {
  seller: Seller | null;
  user: Seller | null; // Alias for seller
  isLoading: boolean;
  loading: boolean; // Alias for isLoading
  isAuthenticated: boolean;
  isLoggedIn: boolean; // Alias for isAuthenticated
  logout: () => void;
  refreshSeller: () => Promise<void>;
  setSeller: (seller: Seller | null) => void;
  setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchSeller = async () => {
    try {
      const response = await sellerAPI.getLoggedInSeller();
      if (response.success && response.seller) {
        setSeller(response.seller);
        setIsAuthenticated(true);
        // Store in localStorage to persist login
        localStorage.setItem("seller", JSON.stringify(response.seller));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to fetch seller:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setSeller(null);
    setIsAuthenticated(false);
    localStorage.removeItem("seller");
    window.location.href = "/login";
  };

  const refreshSeller = async () => {
    const success = await fetchSeller();
    if (!success) {
      // Only clear state if refresh explicitly fails
      setSeller(null);
      setIsAuthenticated(false);
      localStorage.removeItem("seller");
    }
  };

  useEffect(() => {
    // Check localStorage first for persisted login
    const storedSeller = localStorage.getItem("seller");
    if (storedSeller) {
      try {
        const parsedSeller = JSON.parse(storedSeller);
        setSeller(parsedSeller);
        setIsAuthenticated(true);
        setIsLoading(false);

        // Verify with server in background (non-blocking)
        // If verification fails, we keep the localStorage data
        // This allows the user to stay logged in even if there's a network issue
        sellerAPI
          .getLoggedInSeller()
          .then((response) => {
            if (response.success && response.seller) {
              // Update with fresh data from server
              setSeller(response.seller);
              localStorage.setItem("seller", JSON.stringify(response.seller));
            }
          })
          .catch((error) => {
            console.log(
              "Background verification failed, but keeping logged in state:",
              error
            );
            // Don't clear the state - keep user logged in
            // They will be logged out when they try to access protected resources
          });
        return;
      } catch (error) {
        console.error("Error parsing stored seller:", error);
        localStorage.removeItem("seller");
      }
    }

    // If no stored data, verify with server
    fetchSeller();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        seller,
        user: seller, // Alias
        isLoading,
        loading: isLoading, // Alias
        isAuthenticated,
        isLoggedIn: isAuthenticated, // Alias
        logout,
        refreshSeller,
        setSeller,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
