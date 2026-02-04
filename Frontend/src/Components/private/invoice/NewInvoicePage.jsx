import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2, FiSearch, FiPackage, FiFileText, FiMove, FiSave } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);

  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    orderNumber: "",
    terms: "",
    salesperson: "",
    subject: "",
    customerNotes: "Thanks for your business.",
    paymentStatus: "unpaid",
    paymentMode: "",
    paymentDate: "",
    paymentReference: "",
    discountPercent: 0,
    shippingCharges: 0,
    adjustment: 0,
    items: [],
  });

  // Format currency in Rs.
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `Rs. ${num.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Generate invoice number
  const invoiceNumber = useMemo(() => {
    const num = String(invoiceCount + 1).padStart(6, "0");
    return `INV-${num}`;
  }, [invoiceCount]);

  // Fetch data on mount
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchInvoiceCount();
  }, []);

  const fetchCustomers = async () => {
    const result = await apiRequest(API_ENDPOINTS.customers);
    if (result.success) {
      setCustomers(result.data || []);
    }
  };

  const fetchProducts = async () => {
    const result = await apiRequest(API_ENDPOINTS.items);
    if (result.success) {
      setProducts(result.data || []);
    }
  };

  const fetchInvoiceCount = async () => {
    const result = await apiRequest(API_ENDPOINTS.invoices);
    if (result.success) {
      setInvoiceCount(result.data?.length || 0);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.company?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectCustomer = (customer) => {
    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.name,
    });
    setCustomerSearch("");
    setShowCustomerDropdown(false);
  };

  const addProduct = (product) => {
    const existingIndex = formData.items.findIndex((i) => i.productId === product.id);

    if (existingIndex >= 0) {
      const newItems = [...formData.items];
      newItems[existingIndex].quantity += 1;
      setFormData({ ...formData, items: newItems });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            productId: product.id,
            productName: product.name,
            productSku: product.sku || "",
            quantity: 1,
            unitPrice: product.salePrice || product.price || 0,
            discount: 0,
            tax: product.taxRate || 0,
            stockOnHand: product.stockOnHand || 0,
          },
        ],
      });
    }
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] =
      field === "quantity" || field === "unitPrice" || field === "discount" || field === "tax"
        ? parseFloat(value) || 0
        : value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const calculateItemAmount = (item) => {
    const amount = item.quantity * item.unitPrice;
    const taxAmount = (amount * (item.tax || 0)) / 100;
    return amount + taxAmount;
  };

  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let totalTax = 0;

    formData.items.forEach((item) => {
      const itemAmount = item.quantity * item.unitPrice;
      const itemTax = (itemAmount * (item.tax || 0)) / 100;
      subtotal += itemAmount;
      totalTax += itemTax;
    });

    const discountAmount = (subtotal * (formData.discountPercent || 0)) / 100;
    const shipping = parseFloat(formData.shippingCharges) || 0;
    const adjustment = parseFloat(formData.adjustment) || 0;
    const total = subtotal - discountAmount + totalTax + shipping + adjustment;

    return {
      subtotal,
      totalTax,
      discountAmount,
      shipping,
      adjustment,
      total,
    };
  }, [formData.items, formData.discountPercent, formData.shippingCharges, formData.adjustment]);

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.customerId) {
      setError("Please select a customer");
      return;
    }

    if (formData.items.length === 0) {
      setError("Please add at least one item");
      return;
    }

    // Validate stock
    const stockErrors = formData.items.filter((item) => item.quantity > item.stockOnHand);
    if (stockErrors.length > 0) {
      setError(`Insufficient stock for: ${stockErrors.map((i) => i.productName).join(", ")}`);
      return;
    }

    // Validate payment
    if (formData.paymentStatus === "paid") {
      if (!formData.paymentMode) {
        setError("Payment mode is required for paid invoices");
        return;
      }
      if (!formData.paymentDate) {
        setError("Payment date is required for paid invoices");
        return;
      }
      if ((formData.paymentMode === "card" || formData.paymentMode === "online") && !formData.paymentReference) {
        setError("Payment reference is required for card/online payments");
        return;
      }
    }

    setLoading(true);

    const payload = {
      customerId: formData.customerId,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      orderNumber: formData.orderNumber,
      terms: formData.terms,
      salesperson: formData.salesperson,
      subject: formData.subject,
      customerNotes: formData.customerNotes,
      paymentStatus: formData.paymentStatus,
      paymentMode: formData.paymentStatus === "paid" ? formData.paymentMode : null,
      paymentDate: formData.paymentStatus === "paid" ? formData.paymentDate : null,
      paymentReference: formData.paymentStatus === "paid" ? formData.paymentReference : null,
      discountPercent: formData.discountPercent,
      shippingCharges: formData.shippingCharges,
      adjustment: formData.adjustment,
      notes: formData.customerNotes,
      status: "finalized",
      items: formData.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        tax: item.tax,
      })),
    };

    const result = await apiRequest(API_ENDPOINTS.invoices, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (result.success) {
      navigate("/sales/invoices");
    } else {
      setError(result.error || "Failed to create invoice");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/sales/invoices")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FiFileText className="w-7 h-7 text-blue-600" />
                  New Invoice
                </h1>
                <p className="mt-1 text-sm text-gray-500">Create a new invoice for direct sales</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/sales/invoices")}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || formData.items.length === 0 || !formData.customerId}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
            )}

            {/* Top Section - Customer & Invoice Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left - Customer Selection */}
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    {formData.customerId ? (
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="font-medium text-blue-900">{formData.customerName}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, customerId: "", customerName: "" })}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setShowCustomerDropdown(true);
                          }}
                          onFocus={() => setShowCustomerDropdown(true)}
                          onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                          placeholder="Search customers..."
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {showCustomerDropdown && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.slice(0, 10).map((customer) => (
                                <button
                                  key={customer.id}
                                  type="button"
                                  onClick={() => selectCustomer(customer)}
                                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                >
                                  <p className="font-medium text-gray-900">{customer.name}</p>
                                  <p className="text-sm text-gray-500">{customer.company || customer.email}</p>
                                </button>
                              ))
                            ) : (
                              <p className="px-4 py-3 text-gray-500 text-sm">No customers found</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right - Invoice Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice#</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
                    <select
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Terms</option>
                      <option value="due_on_receipt">Due on Receipt</option>
                      <option value="net_15">Net 15</option>
                      <option value="net_30">Net 30</option>
                      <option value="net_45">Net 45</option>
                      <option value="net_60">Net 60</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salesperson</label>
                    <input
                      type="text"
                      value={formData.salesperson}
                      onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Let your customer know what this Invoice is for"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Item Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-4">Item Table</label>

              {/* Product Search */}
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                  placeholder="Search and add items..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showProductDropdown && productSearch && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.slice(0, 10).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">SKU: {product.sku || "-"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">Rs. {formatCurrency(product.salePrice || product.price)}</p>
                              <p className="text-xs text-gray-500">Stock: {product.stockOnHand || 0}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-gray-500 text-sm">No products found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="w-10 px-2 py-3 text-xs font-semibold text-gray-500"></th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Item Details</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-24">Quantity</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-32">Rate</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-24">Tax</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase w-36">Amount</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {formData.items.length > 0 ? (
                      formData.items.map((item, index) => (
                        <tr key={item.productId} className="hover:bg-gray-50">
                          <td className="px-2 py-3 text-center">
                            <FiMove className="w-4 h-4 text-gray-400 cursor-move mx-auto" />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              SKU: {item.productSku || "-"} | Stock: {item.stockOnHand}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", e.target.value)}
                              className={`w-full text-center px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                item.quantity > item.stockOnHand ? "border-red-300 bg-red-50" : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                              className="w-full text-right px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.tax}
                              onChange={(e) => updateItem(index, "tax", e.target.value)}
                              className="w-full text-center px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatCurrency(calculateItemAmount(item))}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                          <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-lg font-medium">No items added</p>
                          <p className="text-sm">Search and add items above to get started</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section - Notes & Totals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Notes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
                <textarea
                  value={formData.customerNotes}
                  onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                  rows={4}
                  placeholder="Thanks for your business."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">Will be displayed on the invoice</p>
              </div>

              {/* Totals */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-semibold text-lg">{formatCurrency(totals.subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">Discount</span>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-24 bg-white">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.discountPercent}
                          onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 text-center focus:outline-none"
                        />
                        <span className="px-2 py-1.5 bg-gray-100 text-gray-600 border-l border-gray-300">%</span>
                      </div>
                    </div>
                    <span className="font-semibold text-lg text-red-600">-{formatCurrency(totals.discountAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping Charges</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.shippingCharges}
                      onChange={(e) => setFormData({ ...formData, shippingCharges: parseFloat(e.target.value) || 0 })}
                      className="w-32 px-2 py-1.5 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Adjustment</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.adjustment}
                      onChange={(e) => setFormData({ ...formData, adjustment: parseFloat(e.target.value) || 0 })}
                      className="w-32 px-2 py-1.5 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total ( Rs. )</span>
                    <span className="font-bold text-2xl text-blue-600">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Payment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {formData.paymentStatus === "paid" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                      <select
                        value={formData.paymentMode}
                        onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select...</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="online">Online</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                      <input
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    {(formData.paymentMode === "card" || formData.paymentMode === "online") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference *</label>
                        <input
                          type="text"
                          value={formData.paymentReference}
                          onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                          placeholder="Transaction ID..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewInvoicePage;
