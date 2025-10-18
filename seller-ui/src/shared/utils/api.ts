import axios, { AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized, clear the stored seller data
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("seller");
      // Only redirect if we're not already on the login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Seller Authentication APIs
export const sellerAPI = {
  register: async (data: {
    name: string;
    email: string;
    phone_number: string;
    country: string;
    password: string;
  }) => {
    const response = await api.post("/seller-registration", data);
    return response.data;
  },

  verifyOTP: async (data: {
    email: string;
    otp: string;
    password: string;
    name: string;
    phone_number: string;
    country: string;
  }) => {
    const response = await api.post("/verify-seller", data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/login-seller", data);
    return response.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await api.post("/forgot-password-user", data);
    return response.data;
  },

  verifyForgotPasswordOTP: async (data: { email: string; otp: string }) => {
    const response = await api.post("/verify-forgot-password-user", data);
    return response.data;
  },

  resetPassword: async (data: { email: string; newPassword: string }) => {
    const response = await api.post("/reset-password-user", data);
    return response.data;
  },

  getLoggedInSeller: async () => {
    const response = await api.get("/logged-in-seller");
    return response.data;
  },

  createShop: async (data: {
    name: string;
    bio: string;
    address: string;
    opening_hours: string;
    website?: string;
    category: string;
    sellerId: string;
  }) => {
    const response = await api.post("/create-shop", data);
    return response.data;
  },

  createStripeLink: async (data: { sellerId: string }) => {
    const response = await api.post("/create-stripe-link", data);
    return response.data;
  },

  getSellerShop: async (sellerId: string) => {
    const response = await api.get(`/seller-shop/${sellerId}`);
    return response.data;
  },

  updateSellerShop: async (
    sellerId: string,
    data: {
      shopName?: string;
      bio?: string;
      address?: string;
      opening_hours?: string;
      website?: string;
      category?: string;
      coverBanner?: string;
      socialLinks?: any[];
    }
  ) => {
    const response = await api.put(`/seller-shop/${sellerId}`, data);
    return response.data;
  },

  updateSellerProfile: async (
    sellerId: string,
    data: {
      name?: string;
      phone_number?: string;
      country?: string;
    }
  ) => {
    const response = await api.put(`/seller-profile/${sellerId}`, data);
    return response.data;
  },
};

// Catalogue/Product APIs
export const catalogueAPI = {
  addProduct: async (data: {
    title: string;
    price_LKR: number;
    image_url?: string;
    currency?: string;
    source_url?: string;
    website?: string;
    source_domain?: string;
  }) => {
    const catalogueUrl = "http://localhost:8080/catalogue";
    const response = await axios.post(`${catalogueUrl}/add`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  getAllProducts: async () => {
    const catalogueUrl = "http://localhost:8080/catalogue";
    const response = await axios.get(catalogueUrl);
    return response.data;
  },

  searchProducts: async (searchTerm: string, limit: number = 10) => {
    const catalogueUrl = "http://localhost:8080/catalogue";
    const response = await axios.post(`${catalogueUrl}/search`, {
      searchTerm,
      limit,
    });
    return response.data;
  },

  filterProducts: async (filters: {
    priceMin?: number;
    priceMax?: number;
    website?: string;
    currency?: string;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  }) => {
    const catalogueUrl = "http://localhost:8080/catalogue";
    const response = await axios.post(`${catalogueUrl}/filter`, filters);
    return response.data;
  },
};

export default api;
