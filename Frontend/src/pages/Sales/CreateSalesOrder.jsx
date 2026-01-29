import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronDown,
  FiPlus,
  FiTrash2,
  FiSearch,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import AddCustomerModal from "../../Components/private/Sales/AddCustomerModal";

// Dummy Customers Data
const fallbackCustomers = [
  { id: 1, name: "John Smith", company: "Tech Solutions Inc.", email: "john@techsolutions.com" },
  { id: 2, name: "Sarah Johnson", company: "HealthCare Plus", email: "sarah@healthcareplus.com" },
  { id: 3, name: "Michael Brown", company: "Brown Enterprises", email: "michael@brownent.com" },
  { id: 4, name: "Emily Davis", company: "MediSupply Co.", email: "emily@medisupply.com" },
  { id: 5, name: "Robert Wilson", company: "Wilson Pharmacy", email: "robert@wilsonpharm.com" },
];

// Salespersons
const fallbackSalespersons = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Mike Johnson" },
  { id: 4, name: "Sarah Williams" },
];

// Format date as "dd MMM yyyy"
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// Generate order number
const generateOrderNumber = () => {
  const num = Math.floor(Math.random() * 99999) + 1;
  return `SO-${String(num).padStart(5, "0")}`;
};

const CreateSalesOrder = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // Form State
  const [orderNumber] = useState(generateOrderNumber());
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [referenceNumber, setReferenceNumber] = useState("");
  const [orderDate, setOrderDate] = useState(today);
  const [shipmentDate, setShipmentDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [salesperson, setSalesperson] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Items State
  const [items, setItems] = useState([
    { id: Date.now(), productId: null, product: null, quantity: 1, rate: 0 },
  ]);

  // Summary State
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [adjustment, setAdjustment] = useState(0);

  // Product dropdown state
  const [activeProductDropdown, setActiveProductDropdown] = useState(null);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    const fetchLookups = async () => {
      const [customersResult, productsResult, usersResult] = await Promise.all([
        apiRequest(API_ENDPOINTS.customers),
        apiRequest(API_ENDPOINTS.items),
        apiRequest(API_ENDPOINTS.users),
      ]);

      if (customersResult.success) {
        setCustomers(customersResult.data || []);
      } else {
        setCustomers(fallbackCustomers);
      }

      if (productsResult.success) {
        const normalized = (productsResult.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku || "",
          rate: Number(item.sellingPrice || 0),
          stock: item.stockOnHand ?? 0,
        }));
        setProducts(normalized);
      } else {
        setProducts([]);
      }

      if (usersResult.success) {
        const normalized = (usersResult.data || []).map((user) => ({
          id: user.id,
          name: user.ownerName || user.pharmacyName || user.email,
        }));
        setSalespersons(normalized);
      } else {
        setSalespersons(fallbackSalespersons);
      }
    };

    fetchLookups();
  }, []);

  const customerSource = customers.length ? customers : fallbackCustomers;
  const productSource = products;
  const salespersonSource = salespersons.length ? salespersons : fallbackSalespersons;

  // Filter customers
  const filteredCustomers = customerSource.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter products
  const filteredProducts = productSource.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  // Calculate totals
  const totals = useMemo(() => {
    let subTotal = 0;

    items.forEach((item) => {
      if (item.productId) {
        const amount = item.quantity * item.rate;
        subTotal += amount;
      }
    });

    const discountAmount =
      discountType === "amount"
        ? Math.min(discountValue, subTotal)
        : (subTotal * discountValue) / 100;
    const total = subTotal - discountAmount + shippingCharges + adjustment;

    return { subTotal, discountAmount, total };
  }, [items, discountType, discountValue, shippingCharges, adjustment]);

  // Handle customer select
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDropdownOpen(false);
    setCustomerSearch("");
    setFormErrors((prev) => ({ ...prev, customer: "" }));
  };

  // Handle product select for item
  const handleProductSelect = (itemId, product) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              productId: product.id,
              product,
              rate: product.rate,
              quantity: item.quantity > 0 ? item.quantity : 1,
            }
          : item
      )
    );
    setActiveProductDropdown(null);
    setProductSearch("");
    setFormErrors((prev) => ({ ...prev, items: "" }));
  };

  // Handle item field change
  const handleItemChange = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  };

  // Add new item row
  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), productId: null, product: null, quantity: 1, rate: 0 },
    ]);
    setFormErrors((prev) => ({ ...prev, items: "" }));
  };

  // Remove item row
  const removeItemRow = (itemId) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  // Calculate item amount
  const getItemAmount = (item) => {
    return item.quantity * item.rate;
  };

  const handleAddCustomer = async (customerData) => {
    const result = await apiRequest(API_ENDPOINTS.customers, {
      method: "POST",
      body: JSON.stringify(customerData),
    });

    if (result.success) {
      setCustomers((prev) => [result.data, ...prev]);
      setSelectedCustomer(result.data);
      setCustomerDropdownOpen(false);
      setCustomerSearch("");
      setFormErrors((prev) => ({ ...prev, customer: "" }));
    }

    return result;
  };

  // Handle save
  const handleSave = (status) => {
    const newErrors = {};
    if (!selectedCustomer) {
      newErrors.customer = "Please select a customer.";
    }
    if (!items.some((item) => item.productId)) {
      newErrors.items = "Please add at least one item.";
    }
    if (Object.keys(newErrors).length) {
      setFormErrors(newErrors);
      return;
    }

    const orderData = {
      orderNumber,
      customer: selectedCustomer,
      referenceNumber,
      orderDate,
      shipmentDate,
      deliveryMethod,
      salesperson,
      items: items.filter((item) => item.productId),
      customerNotes,
      discountType,
      discountValue,
      shippingCharges,
      adjustment,
      ...totals,
      status,
    };

    console.log("Saving order:", orderData);
    alert(`Sales Order ${status === "draft" ? "saved as draft" : "confirmed"}!`);
    navigate("/sales/orders");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/sales/orders")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">New Sales Order</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/sales/orders")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave("draft")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave("confirmed")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save and Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-5">
              {/* Customer Name */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                    className="w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between"
                  >
                    <span className={selectedCustomer ? "text-gray-900" : "text-gray-400"}>
                      {selectedCustomer ? selectedCustomer.name : "Select a customer"}
                    </span>
                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {customerDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Search customers..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex flex-col"
                          >
                            <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                            <span className="text-xs text-gray-500">{customer.company}</span>
                          </button>
                        ))}
                        {filteredCustomers.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">No customers found</div>
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setIsCustomerModalOpen(true);
                            setCustomerDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add New Customer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {formErrors.customer && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.customer}</p>
                )}
              </div>

              {/* Sales Order # */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Order#
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono"
                />
              </div>

              {/* Reference # */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference#
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder=""
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Sales Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Order Date
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {orderDate && (
                  <p className="mt-1 text-xs text-gray-500">{formatDate(orderDate)}</p>
                )}
              </div>

              {/* Expected Shipment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Shipment Date
                </label>
                <input
                  type="date"
                  value={shipmentDate}
                  onChange={(e) => setShipmentDate(e.target.value)}
                  placeholder="dd MMM yyyy"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {shipmentDate && (
                  <p className="mt-1 text-xs text-gray-500">{formatDate(shipmentDate)}</p>
                )}
              </div>

              {/* Delivery Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Method
                </label>
                <input
                  type="text"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  placeholder="Select a delivery method or type to add"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Salesperson */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salesperson
                </label>
                <select
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select salesperson</option>
                  {salespersonSource.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Item Table */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Item Table</h3>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="col-span-6">Item Details</div>
                    <div className="col-span-2 text-right">Quantity</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50">
                      {/* Item Details */}
                      <div className="col-span-6 relative">
                        <button
                          type="button"
                          onClick={() => setActiveProductDropdown(activeProductDropdown === item.id ? null : item.id)}
                          className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                        >
                          {item.product ? (
                            <span className="text-gray-900">{item.product.name}</span>
                          ) : (
                            <span className="text-gray-400">Type or click to select an item</span>
                          )}
                        </button>

                        {activeProductDropdown === item.id && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="p-2 border-b border-gray-100">
                              <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                  type="text"
                                  value={productSearch}
                                  onChange={(e) => setProductSearch(e.target.value)}
                                  placeholder="Search items..."
                                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredProducts.map((product) => (
                                <button
                                  key={product.id}
                                  onClick={() => handleProductSelect(item.id, product)}
                                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex justify-between items-center"
                                >
                                  <div>
                                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({product.sku})</span>
                                  </div>
                                  <span className="text-sm text-gray-600">NPR {product.rate.toFixed(2)}</span>
                                </button>
                              ))}
                              {filteredProducts.length === 0 && (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                  No items found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(item.id, "quantity", Math.max(1, parseInt(e.target.value || "1", 10)))
                          }
                          className="w-full px-3 py-2 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Rate */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          readOnly
                          className="w-full px-3 py-2 text-right border border-gray-300 rounded-lg bg-gray-50 text-sm"
                        />
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 text-right flex-1">
                          {getItemAmount(item).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItemRow(item.id)}
                          className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          disabled={items.length === 1}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Row Button */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={addItemRow}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add another line
                  </button>
                </div>
              </div>
              {formErrors.items && (
                <p className="mt-2 text-sm text-red-600">{formErrors.items}</p>
              )}
            </div>

            {/* Bottom Section - Notes & Summary */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Notes
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Enter any notes to be displayed in your transaction"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="space-y-3">
                  {/* Sub Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sub Total</span>
                    <span className="text-sm font-medium text-gray-900">{totals.subTotal.toFixed(2)}</span>
                  </div>

                  {/* Discount */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Discount</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="percent">%</option>
                        <option value="amount">NPR</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        max={discountType === "amount" ? undefined : 100}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-right border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900 w-20 text-right">
                        {totals.discountAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Charges */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Shipping Charges</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingCharges}
                      onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                      className="w-28 px-3 py-1 text-right border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Adjustment */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Adjustment</span>
                    <input
                      type="number"
                      step="0.01"
                      value={adjustment}
                      onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                      className="w-28 px-3 py-1 text-right border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Total */}
                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Total ( NPR )</span>
                      <span className="text-xl font-bold text-blue-600">{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handler for dropdowns */}
      {(customerDropdownOpen || activeProductDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setCustomerDropdownOpen(false);
            setActiveProductDropdown(null);
          }}
        />
      )}

      <AddCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleAddCustomer}
      />
    </div>
  );
};

export default CreateSalesOrder;
