import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
}

export interface VerifyUserData {
  email: string;
  otp: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyForgotPasswordData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

export const authAPI = {
  // User Registration - Send OTP
  userRegistration: async (data: UserRegistrationData) => {
    const response = await api.post("/user-registration", data);
    return response.data;
  },

  // Verify User - Complete Registration
  verifyUser: async (data: VerifyUserData) => {
    const response = await api.post("/verify-user", data);
    return response.data;
  },

  // Login User
  loginUser: async (data: LoginData) => {
    const response = await api.post("/login-user", data);
    return response.data;
  },

  // Forgot Password - Send OTP
  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await api.post("/forgot-password-user", data);
    return response.data;
  },

  // Verify Forgot Password OTP
  verifyForgotPassword: async (data: VerifyForgotPasswordData) => {
    const response = await api.post("/verify-forgot-password-user", data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post("/reset-password-user", data);
    return response.data;
  },
};

// Catalogue API - via API Gateway
const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export interface Product {
  id: string;
  title: string;
  price_LKR: number;
  currency: string;
  image_url: string;
  website: string;
  source_url: string;
  scraped_at: string;
  created_at: string;
  last_updated: string;
}

export interface SearchProductsParams {
  searchTerm: string;
  limit?: number;
  offset?: number;
}

export interface FilterProductsParams {
  priceMin?: number;
  priceMax?: number;
  website?: string;
  currency?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export const catalogueAPI = {
  // Get all products
  getAllProducts: async () => {
    const response = await axios.get(`${GATEWAY_URL}/catalogue`);
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string) => {
    const response = await axios.get(`${GATEWAY_URL}/catalogue/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (params: SearchProductsParams) => {
    const response = await axios.post(
      `${GATEWAY_URL}/catalogue/search`,
      params
    );
    return response.data;
  },

  // Filter products
  filterProducts: async (params: FilterProductsParams) => {
    const response = await axios.post(
      `${GATEWAY_URL}/catalogue/filter`,
      params
    );
    return response.data;
  },
};

// Cart API - via API Gateway
export interface CartItem {
  id: string;
  userId: string;
  itemId: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartParams {
  userId: string;
  itemId: string;
  price: number;
  quantity: number;
}

export interface UpdateCartItemParams {
  quantity: number;
}

export const cartAPI = {
  // Add item to cart
  addToCart: async (params: AddToCartParams) => {
    const response = await axios.post(`${GATEWAY_URL}/cart`, params);
    return response.data;
  },

  // Get user's cart
  getUserCart: async (userId: string) => {
    const response = await axios.get(`${GATEWAY_URL}/cart/${userId}`);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (id: string, params: UpdateCartItemParams) => {
    const response = await axios.patch(`${GATEWAY_URL}/cart/${id}`, params);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (id: string) => {
    const response = await axios.delete(`${GATEWAY_URL}/cart/${id}`);
    return response.data;
  },

  // Clear user's cart
  clearCart: async (userId: string) => {
    const response = await axios.delete(`${GATEWAY_URL}/cart/user/${userId}`);
    return response.data;
  },

  // Get cart item by ID
  getCartItemById: async (id: string) => {
    const response = await axios.get(`${GATEWAY_URL}/cart/item/${id}`);
    return response.data;
  },
};

// Wishlist API
export interface AddToWishlistParams {
  userId: string;
  itemId: string;
}

export const wishlistAPI = {
  // Add to wishlist
  addToWishlist: async (params: AddToWishlistParams) => {
    const response = await axios.post(`${GATEWAY_URL}/wishlist`, params);
    return response.data;
  },

  // Get user's wishlist
  getUserWishlist: async (userId: string) => {
    const response = await axios.get(`${GATEWAY_URL}/wishlist/${userId}`);
    return response.data;
  },

  // Get wishlist count
  getWishlistCount: async (userId: string) => {
    const response = await axios.get(`${GATEWAY_URL}/wishlist/${userId}/count`);
    return response.data;
  },

  // Check if item is in wishlist
  isItemInWishlist: async (userId: string, itemId: string) => {
    const response = await axios.get(
      `${GATEWAY_URL}/wishlist/${userId}/item/${itemId}`
    );
    return response.data;
  },

  // Remove from wishlist by ID
  removeFromWishlist: async (id: string) => {
    const response = await axios.delete(`${GATEWAY_URL}/wishlist/${id}`);
    return response.data;
  },

  // Remove from wishlist by userId and itemId
  removeFromWishlistByItem: async (userId: string, itemId: string) => {
    const response = await axios.delete(
      `${GATEWAY_URL}/wishlist/user/${userId}/item/${itemId}`
    );
    return response.data;
  },
};

// Inventory API
export interface InventoryItem {
  id: string;
  userId: string;
  itemId?: string;
  itemName: string;
  count: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddInventoryItemParams {
  userId: string;
  itemId?: string;
  itemName: string;
  count: number;
  unit: string;
}

export interface UpdateInventoryItemParams {
  itemName?: string;
  count?: number;
  unit?: string;
  itemId?: string;
}

export const inventoryAPI = {
  // Add inventory item
  addInventoryItem: async (params: AddInventoryItemParams) => {
    const response = await axios.post(`${GATEWAY_URL}/inventory`, params);
    return response.data;
  },

  // Get user's inventory
  getUserInventory: async (userId: string) => {
    const response = await axios.get(`${GATEWAY_URL}/inventory/user/${userId}`);
    return response.data;
  },

  // Get all inventory items (admin)
  getAllInventoryItems: async () => {
    const response = await axios.get(`${GATEWAY_URL}/inventory`);
    return response.data;
  },

  // Get inventory item by ID
  getInventoryItemById: async (id: string) => {
    const response = await axios.get(`${GATEWAY_URL}/inventory/item/${id}`);
    return response.data;
  },

  // Update inventory item
  updateInventoryItem: async (
    id: string,
    params: UpdateInventoryItemParams
  ) => {
    const response = await axios.put(`${GATEWAY_URL}/inventory/${id}`, params);
    return response.data;
  },

  // Delete inventory item
  deleteInventoryItem: async (id: string) => {
    const response = await axios.delete(`${GATEWAY_URL}/inventory/${id}`);
    return response.data;
  },

  // Update item count
  updateItemCount: async (id: string, count: number) => {
    const response = await axios.patch(`${GATEWAY_URL}/inventory/${id}/count`, {
      count,
    });
    return response.data;
  },
};

export default api;
