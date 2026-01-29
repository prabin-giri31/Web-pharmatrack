import React, { useState, useEffect, useRef } from "react";
import { FiX, FiCalendar, FiArrowUp, FiArrowDown, FiSave, FiLoader, FiPackage, FiSearch, FiChevronDown } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";
import { getUser } from "../../../utils/auth";
import { inventoryAdjustmentSchema } from "../schema/inventoryAdjustmentSchema";

const NewAdjustmentModal = ({ isOpen, onClose, onSuccess }) => {
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get current user
  const currentUser = getUser();

  // Form state
  const [formData, setFormData] = useState({
    itemId: "",
    date: getTodayDate(),
    type: "Increase",
    reason: "",
    description: "",
    reference: "",
    quantity: "",
    createdBy: currentUser?.name || currentUser?.email || "Unknown User",
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Items state
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);

  // Fetch items from API
  const fetchItems = async () => {
    setItemsLoading(true);
    try {
      const result = await apiRequest(API_ENDPOINTS.items);
      if (result.success) {
        setItems(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setItemsLoading(false);
    }
  };

  // Fetch items when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.sku?.toLowerCase().includes(itemSearch.toLowerCase())
  );

  // Get selected item details
  const selectedItem = items.find((item) => item.id === Number(formData.itemId));

  // Handle click outside dropdown to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsItemDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        itemId: "",
        date: getTodayDate(),
        type: "Increase",
        reason: "",
        description: "",
        reference: "",
        quantity: "",
        createdBy: currentUser?.name || currentUser?.email || "Unknown User",
      });
      setErrors({});
      setSubmitError(null);
      setItemSearch("");
      setIsItemDropdownOpen(false);
      // Focus first input when modal opens
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside modal to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const result = inventoryAdjustmentSchema.safeParse(formData);
    if (!result.success) {
      const newErrors = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0]] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        itemId: Number(formData.itemId),
        itemName: selectedItem?.name || null,
        date: formData.date,
        type: formData.type,
        reason: formData.reason,
        description: formData.description || null,
        reference: formData.reference || null,
        quantity: Number(formData.quantity),
        createdBy: formData.createdBy,
        status: "Completed",
      };

      const result = await apiRequest(`${API_ENDPOINTS.inventory}/adjustments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setSubmitError(result.error || "Failed to create adjustment");
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reason options
  const reasonOptions = [
    "Purchase",
    "Sale",
    "Damage",
    "Return",
    "Loss",
    "Stock Count Correction",
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl transform transition-all animate-slideUp max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-bold text-gray-800"
            >
              New Inventory Adjustment
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Record stock increase or decrease
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5">
          <div className="space-y-5">
            {/* Item Field - Searchable Dropdown */}
            <div ref={dropdownRef}>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Item <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {/* Selected Item Display / Search Input */}
                <div
                  ref={firstInputRef}
                  tabIndex={0}
                  onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsItemDropdownOpen(!isItemDropdownOpen);
                    }
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer bg-white flex items-center justify-between ${
                    errors.itemId ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FiPackage className={`text-lg flex-shrink-0 ${selectedItem ? "text-blue-500" : "text-gray-400"}`} />
                    {selectedItem ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{selectedItem.name}</span>
                        {selectedItem.sku && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
                            {selectedItem.sku}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Select an item...</span>
                    )}
                  </div>
                  <FiChevronDown className={`text-gray-400 transition-transform flex-shrink-0 ${isItemDropdownOpen ? "rotate-180" : ""}`} />
                </div>

                {/* Dropdown */}
                {isItemDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={itemSearch}
                          onChange={(e) => setItemSearch(e.target.value)}
                          placeholder="Search items..."
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="max-h-48 overflow-y-auto">
                      {itemsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <FiLoader className="text-blue-500 animate-spin text-lg" />
                          <span className="ml-2 text-sm text-gray-500">Loading items...</span>
                        </div>
                      ) : filteredItems.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500">
                          {itemSearch ? "No items found" : "No items available"}
                        </div>
                      ) : (
                        filteredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, itemId: item.id.toString() }));
                              setIsItemDropdownOpen(false);
                              setItemSearch("");
                              if (errors.itemId) {
                                setErrors((prev) => ({ ...prev, itemId: null }));
                              }
                            }}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition hover:bg-blue-50 ${
                              formData.itemId === item.id.toString() ? "bg-blue-50" : ""
                            }`}
                          >
                            <FiPackage className={`text-lg flex-shrink-0 ${
                              formData.itemId === item.id.toString() ? "text-blue-500" : "text-gray-400"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${
                                formData.itemId === item.id.toString() ? "text-blue-700" : "text-gray-800"
                              }`}>
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.sku && (
                                  <span className="text-xs text-gray-500">SKU: {item.sku}</span>
                                )}
                                {item.stockOnHand !== undefined && (
                                  <span className="text-xs text-gray-400">• Stock: {item.stockOnHand}</span>
                                )}
                              </div>
                            </div>
                            {formData.itemId === item.id.toString() && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.itemId && (
                <p className="mt-1 text-sm text-red-500">{errors.itemId}</p>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.date ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                />
                <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Type Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: "Increase" }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition ${
                    formData.type === "Increase"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FiArrowUp
                    className={`text-lg ${
                      formData.type === "Increase" ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  Increase
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: "Decrease" }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition ${
                    formData.type === "Decrease"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FiArrowDown
                    className={`text-lg ${
                      formData.type === "Decrease" ? "text-orange-600" : "text-gray-400"
                    }`}
                  />
                  Decrease
                </button>
              </div>
            </div>

            {/* Reason Field */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Reason <span className="text-red-500">*</span>
              </label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer bg-white ${
                  errors.reason ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              >
                <option value="">Select a reason...</option>
                {reasonOptions.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
              )}
            </div>

            {/* Quantity Field */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                min="1"
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.quantity ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            {/* Reference Field */}
            <div>
              <label
                htmlFor="reference"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Reference{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="e.g., PO-12345, INV-001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description / Notes{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Created By Field (Read-only) */}
            <div>
              <label
                htmlFor="createdBy"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Created By
              </label>
              <input
                type="text"
                id="createdBy"
                name="createdBy"
                value={formData.createdBy}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="text-lg animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="text-lg" />
                Save Adjustment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NewAdjustmentModal;
