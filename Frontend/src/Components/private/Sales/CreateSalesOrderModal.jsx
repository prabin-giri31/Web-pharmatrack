import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiSave,
  FiLoader,
  FiSearch,
  FiChevronDown,
  FiAlertTriangle,
  FiUser,
  FiCalendar,
  FiPackage,
} from "react-icons/fi";

const CreateSalesOrderModal = ({
  isOpen,
  onClose,
  onSave,
  editingOrder,
  customers,
  products,
  generateOrderNumber,
}) => {
  const modalRef = useRef(null);

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split("T")[0];
  };

  const initialFormData = {
    customerId: "",
    orderDate: getTodayDate(),
    expectedDeliveryDate: getDeliveryDate(),
    status: "draft",
    paymentStatus: "unpaid",
    paymentMethod: "",
    dueDate: "",
    advancePayment: 0,
    notes: "",
    items: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Product selection state
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const productDropdownRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingOrder) {
        setFormData({
          ...editingOrder,
          customerId: editingOrder.customerId.toString(),
        });
        setSelectedCustomer(editingOrder.customer);
      } else {
        setFormData(initialFormData);
        setSelectedCustomer(null);
      }
      setErrors({});
    }
  }, [isOpen, editingOrder]);

  // Handle click outside product dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Calculate totals
  const getDiscountAmount = (subtotal, discount, discountType) => {
    if (!discount) return 0;
    if (discountType === "amount") {
      return Math.min(discount, subtotal);
    }
    return (subtotal * discount) / 100;
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = getDiscountAmount(subtotal, item.discount, item.discountType);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * item.tax) / 100;
    return afterDiscount + taxAmount;
  };

  const calculateOrderTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    formData.items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = getDiscountAmount(itemSubtotal, item.discount, item.discountType);
      const afterDiscount = itemSubtotal - discountAmount;
      const taxAmount = (afterDiscount * item.tax) / 100;

      subtotal += itemSubtotal;
      totalDiscount += discountAmount;
      totalTax += taxAmount;
    });

    const grandTotal = subtotal - totalDiscount + totalTax;
    return { subtotal, totalDiscount, totalTax, grandTotal };
  };

  const totals = calculateOrderTotals();

  // Handlers
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setFormData({ ...formData, customerId });
    const customer = customers.find((c) => c.id === parseInt(customerId));
    setSelectedCustomer(customer || null);
    if (errors.customerId) setErrors({ ...errors, customerId: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleAddProduct = (product) => {
    // Check if product already exists
    const existingIndex = formData.items.findIndex((item) => item.productId === product.id);
    if (existingIndex >= 0) {
      // Increase quantity
      const newItems = [...formData.items];
      newItems[existingIndex].quantity += 1;
      setFormData({ ...formData, items: newItems });
    } else {
      // Add new item
      const newItem = {
        productId: product.id,
        product: product,
        quantity: 1,
        unitPrice: product.unitPrice,
        discount: 0,
        discountType: "percent",
        tax: product.tax,
      };
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }
    setShowProductDropdown(false);
    setProductSearch("");
    if (errors.items) setErrors({ ...errors, items: "" });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === "discountType") {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = parseFloat(value) || 0;
    }
    setFormData({ ...formData, items: newItems });
  };

  const filteredProducts = products.filter(
    (product) =>
      (product.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.sku || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerId) newErrors.customerId = "Please select a customer";
    if (!formData.orderDate) newErrors.orderDate = "Order date is required";
    if (formData.items.length === 0) newErrors.items = "Please add at least one item";

    // Check stock availability
    for (const item of formData.items) {
      if (item.quantity > item.product.stock) {
        newErrors.items = `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const orderData = {
      ...formData,
      id: editingOrder?.id,
      customerId: parseInt(formData.customerId),
      customer: selectedCustomer,
      ...totals,
    };

    onSave(orderData);
    setIsSubmitting(false);
    onClose();
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-xl font-semibold text-white">
            {editingOrder ? "Edit Sales Order" : "Create New Sales Order"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Order Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Customer & Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-blue-600" />
                  Customer Information
                </h3>

                {/* Customer Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleCustomerChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.customerId
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.company}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                  )}
                </div>

                {/* Customer Details Card */}
                {selectedCustomer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.company}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="orderDate"
                        value={formData.orderDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="expectedDeliveryDate"
                        value={formData.expectedDeliveryDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                  Payment Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select method</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Payment
                  </label>
                  <input
                    type="number"
                    name="advancePayment"
                    value={formData.advancePayment}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Add any notes for this order..."
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                  Order Items
                </h3>
                
                {/* Add Product Button */}
                <div className="relative" ref={productDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Product
                  </button>

                  {/* Product Dropdown */}
                  {showProductDropdown && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-10">
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                          >
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{formatCurrency(product.unitPrice)}</p>
                              <p className={`text-sm ${product.stock < 20 ? "text-red-600" : "text-green-600"}`}>
                                Stock: {product.stock}
                              </p>
                            </div>
                          </button>
                        ))}
                        {filteredProducts.length === 0 && (
                          <p className="text-center text-gray-500 py-4">No products found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <FiAlertTriangle className="w-4 h-4" />
                  {errors.items}
                </div>
              )}

              {/* Items Table */}
              {formData.items.length > 0 ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-24">Qty</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-28">Price</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-32">Disc</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-24">Tax %</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-28">Total</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                              {item.quantity > item.product.stock && (
                                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                                  <FiAlertTriangle className="w-3 h-3" />
                                  Insufficient stock (Available: {item.product.stock})
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              min="1"
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <select
                                value={item.discountType || "percent"}
                                onChange={(e) => handleItemChange(index, "discountType", e.target.value)}
                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="percent">%</option>
                                <option value="amount">Rs.</option>
                              </select>
                              <input
                                type="number"
                                value={item.discount}
                                onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                                min="0"
                                max={item.discountType === "amount" ? undefined : 100}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.tax}
                              onChange={(e) => handleItemChange(index, "tax", e.target.value)}
                              min="0"
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(calculateItemTotal(item))}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No items added yet</p>
                  <p className="text-sm text-gray-500">Click "Add Product" to add items to this order</p>
                </div>
              )}

              {/* Order Summary */}
              {formData.items.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-red-600">-{formatCurrency(totals.totalDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatCurrency(totals.totalTax)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Grand Total</span>
                      <span className="font-bold text-lg text-blue-600">{formatCurrency(totals.grandTotal)}</span>
                    </div>
                    {formData.advancePayment > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Advance Paid</span>
                          <span className="font-medium text-green-600">-{formatCurrency(formData.advancePayment)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-gray-900">Balance Due</span>
                          <span className="text-gray-900">{formatCurrency(totals.grandTotal - formData.advancePayment)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

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
              type="submit"
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
                  {editingOrder ? "Update Order" : "Create Order"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSalesOrderModal;
