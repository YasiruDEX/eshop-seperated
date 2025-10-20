"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../shared/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "../../shared/hooks/useToast";
import {
  inventoryAPI,
  InventoryItem,
  AddInventoryItemParams,
} from "../../shared/utils/api";
import {
  Package,
  Plus,
  Minus,
  Trash2,
  Edit2,
  X,
  Save,
  ChefHat,
} from "lucide-react";

const UNIT_OPTIONS = [
  "kg",
  "g",
  "lb",
  "oz",
  "L",
  "mL",
  "pcs",
  "dozen",
  "cup",
  "tbsp",
  "tsp",
  "bunch",
  "bag",
  "box",
  "can",
  "bottle",
];

const InventoryPage = () => {
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { success, error: showError, ToastContainer } = useToast();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    itemName: "",
    count: 0,
    unit: "pcs",
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking login status
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (user?.id) {
      fetchInventory();
    }
  }, [authLoading, isLoggedIn, user]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getUserInventory(user!.id);
      if (response.success) {
        setItems(response.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      showError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemName.trim()) {
      showError("Please enter an item name");
      return;
    }

    if (formData.count < 0) {
      showError("Count cannot be negative");
      return;
    }

    try {
      const params: AddInventoryItemParams = {
        userId: user!.id,
        itemName: formData.itemName.trim(),
        count: formData.count,
        unit: formData.unit,
      };

      const response = await inventoryAPI.addInventoryItem(params);

      if (response.success) {
        success("✓ Item added to inventory");
        setItems([response.data, ...items]);
        setShowAddModal(false);
        setFormData({ itemName: "", count: 0, unit: "pcs" });
      }
    } catch (err: any) {
      console.error("Error adding item:", err);
      showError("Failed to add item");
    }
  };

  const handleUpdateItem = async (item: InventoryItem) => {
    try {
      const response = await inventoryAPI.updateInventoryItem(item.id, {
        itemName: item.itemName,
        count: item.count,
        unit: item.unit,
      });

      if (response.success) {
        success("✓ Item updated");
        setItems(items.map((i) => (i.id === item.id ? response.data : i)));
        setEditingItem(null);
      }
    } catch (err: any) {
      console.error("Error updating item:", err);
      showError("Failed to update item");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await inventoryAPI.deleteInventoryItem(id);

      if (response.success) {
        success("✓ Item removed from inventory");
        setItems(items.filter((i) => i.id !== id));
      }
    } catch (err: any) {
      console.error("Error deleting item:", err);
      showError("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleIncrement = async (item: InventoryItem) => {
    try {
      const newCount = item.count + 1;
      const response = await inventoryAPI.updateItemCount(item.id, newCount);

      if (response.success) {
        setItems(items.map((i) => (i.id === item.id ? response.data : i)));
      }
    } catch (err: any) {
      console.error("Error updating count:", err);
      showError("Failed to update count");
    }
  };

  const handleDecrement = async (item: InventoryItem) => {
    if (item.count <= 0) return;

    try {
      const newCount = item.count - 1;
      const response = await inventoryAPI.updateItemCount(item.id, newCount);

      if (response.success) {
        setItems(items.map((i) => (i.id === item.id ? response.data : i)));
      }
    } catch (err: any) {
      console.error("Error updating count:", err);
      showError("Failed to update count");
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditingItem({ ...item });
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat size={40} className="text-black" />
              <div>
                <h1 className="text-4xl font-black text-black">
                  Kitchen Inventory
                </h1>
                <p className="text-gray-600">
                  {items.length} {items.length === 1 ? "item" : "items"} in
                  stock
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} />
              Add Item
            </button>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300">
            <Package size={80} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-black text-black mb-2">
              Your Kitchen Inventory is Empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start tracking your kitchen items by adding them to your
              inventory!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          /* Inventory Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isEditing = editingItem?.id === item.id;
              const displayItem = isEditing ? editingItem : item;

              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-black hover:border-gray-600 transition-all duration-300 p-6 relative"
                >
                  {/* Edit/Delete Actions */}
                  {!isEditing && (
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="bg-white border-2 border-black p-2 hover:bg-black hover:text-white transition-colors"
                        title="Edit item"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deletingId === item.id}
                        className="bg-white border-2 border-red-600 text-red-600 p-2 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                        title="Delete item"
                      >
                        {deletingId === item.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Item Name */}
                  <div className="mb-4 pr-20">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingItem.itemName}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            itemName: e.target.value,
                          })
                        }
                        className="w-full text-xl font-black text-black border-2 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      />
                    ) : (
                      <h3 className="text-xl font-black text-black">
                        {displayItem.itemName}
                      </h3>
                    )}
                  </div>

                  {/* Count Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDecrement(item)}
                        disabled={isEditing || item.count <= 0}
                        className="bg-white border-2 border-black p-2 hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus size={18} />
                      </button>

                      {isEditing ? (
                        <input
                          type="number"
                          value={editingItem.count}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              count: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-20 text-2xl font-black text-center border-2 border-black px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                          min="0"
                        />
                      ) : (
                        <span className="text-3xl font-black text-black min-w-[60px] text-center">
                          {displayItem.count}
                        </span>
                      )}

                      <button
                        onClick={() => handleIncrement(item)}
                        disabled={isEditing}
                        className="bg-white border-2 border-black p-2 hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Unit */}
                    {isEditing ? (
                      <select
                        value={editingItem.unit}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            unit: e.target.value,
                          })
                        }
                        className="border-2 border-black px-3 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        {UNIT_OPTIONS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="bg-gray-100 text-black px-4 py-2 font-black border-2 border-black">
                        {displayItem.unit}
                      </span>
                    )}
                  </div>

                  {/* Edit Actions */}
                  {isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateItem(editingItem)}
                        className="flex-1 bg-black text-white py-2 font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 bg-white text-black border-2 border-black py-2 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Timestamp */}
                  {!isEditing && (
                    <p className="text-xs text-gray-500 mt-4">
                      Added{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-black hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black text-black mb-6">
              Add New Item
            </h2>

            <form onSubmit={handleAddItem} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  placeholder="e.g., Rice, Tomatoes, Milk"
                  className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Count *
                  </label>
                  <input
                    type="number"
                    value={formData.count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        count: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    min="0"
                    step="0.01"
                    className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full border-2 border-black px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3 font-bold hover:bg-gray-800 transition-colors"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white text-black border-2 border-black py-3 font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white border-t-4 border-black mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-black text-xl mb-4">TitanStore</h3>
              <p className="text-gray-400">
                Your ultimate destination for quality shopping and kitchen
                management.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">
                    Products
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/profile" className="hover:text-white">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="hover:text-white">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/inventory" className="hover:text-white">
                    Kitchen Inventory
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-white">
                    Shopping Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TitanStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InventoryPage;
