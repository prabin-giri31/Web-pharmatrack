import React, { useState, useEffect, useRef } from "react";
import { FiX, FiUser, FiBriefcase, FiMail, FiPhone, FiSave, FiLoader, FiMapPin } from "react-icons/fi";
import { customerSchema } from "../schema/customerSchema";

const AddCustomerModal = ({ isOpen, onClose, onSave, editingCustomer }) => {
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const initialFormData = {
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Reset form when modal opens or editingCustomer changes
  useEffect(() => {
    if (isOpen) {
      if (editingCustomer) {
        setFormData({
          name: editingCustomer.name || "",
          company: editingCustomer.company || "",
          email: editingCustomer.email || "",
          phone: editingCustomer.phone || "",
          address: editingCustomer.address || "",
          status: editingCustomer.status || "active",
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
      setSaveError("");
      // Focus first input after modal animation
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, editingCustomer]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const result = customerSchema.safeParse(formData);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSaveError("");

    const customerData = {
      id: editingCustomer?.id || Date.now(),
      ...formData,
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    try {
      const result = await onSave(customerData);
      if (result && result.success === false) {
        setSaveError(result.error || "Failed to save customer.");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setSaveError(error?.message || "Failed to save customer.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={firstInputRef}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name (optional)"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="flex items-center">
              <div className="flex items-center gap-2 px-3 py-3 border border-r-0 border-gray-300 rounded-l-xl bg-gray-50 text-gray-700 text-sm">
                <FiPhone className="w-4 h-4 text-gray-400" />
                <span className="font-medium">+977</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData((prev) => ({ ...prev, phone: digitsOnly }));
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                placeholder="Mobile"
                maxLength={10}
                className={`w-full pr-4 py-3 border rounded-r-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.phone
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address (optional)"
                rows={3}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="overdue">Overdue</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                {editingCustomer ? "Update Customer" : "Add Customer"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
