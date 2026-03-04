import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import {
  FiShoppingCart,
  FiChevronLeft,
  FiCheck,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiCalendar,
  FiTruck,
  FiFileText,
  FiHash,
  FiBox,
} from "react-icons/fi";

// Reusable Components
const FormInput = ({ label, required, error, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl transition-all duration-200 outline-none
        ${error
          ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
          : "border-gray-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-300"
        }`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const FormSelect = ({ label, required, children, className = "", error, ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl bg-white transition-all duration-200 outline-none
        ${error
          ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
          : "border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-300"
        }`}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const FormTextarea = ({ label, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <textarea
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white transition-all duration-200 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-300 resize-none"
    />
  </div>
);

const SectionCard = ({ icon: Icon, title, description, children, action }) => (
  <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Icon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const NewPurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showItemSearch, setShowItemSearch] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    referenceNumber: "",
    shippingMethod: "",
    shippingAddress: "",
    shippingCharges: 0,
    notes: "",
    termsAndConditions: "",
  });

  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const result = await apiRequest(API_ENDPOINTS.suppliers);
      if (result.success) {
        setSuppliers(result.data || []);
      }
    };

    const fetchItems = async () => {
      const result = await apiRequest(API_ENDPOINTS.items);
      if (result.success) {
        setItems(result.data || []);
      }
    };

    fetchSuppliers();
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setOrderItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        
        // Recalculate total
        const subtotal = (updated.quantity || 0) * (updated.unitPrice || 0);
        let discount = 0;
        if (updated.discountType === "percentage") {
          discount = subtotal * ((updated.discount || 0) / 100);
        } else {
          discount = updated.discount || 0;
        }
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * ((updated.tax || 0) / 100);
        updated.total = afterDiscount + tax;
        
        return updated;
      })
    );
  };

  const addItem = (item) => {
    const exists = orderItems.find((oi) => oi.itemId === item.id);
    if (exists) {
      setMessage({ type: "error", text: "Item already added" });
      return;
    }

    setOrderItems((prev) => [
      ...prev,
      {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        unit: item.unit,
        quantity: 1,
        unitPrice: item.costPrice || item.sellingPrice || 0,
        discount: 0,
        discountType: "percentage",
        tax: 13,
        total: 0,
        notes: "",
      },
    ]);
    setShowItemSearch(false);
    setSearchTerm("");
  };

  const removeItem = (index) => {
    setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.sku?.toLowerCase().includes(search)
    );
  });

  // Calculate totals
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    orderItems.forEach((item) => {
      const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
      subtotal += itemSubtotal;

      let discount = 0;
      if (item.discountType === "percentage") {
        discount = itemSubtotal * ((item.discount || 0) / 100);
      } else {
        discount = item.discount || 0;
      }
      totalDiscount += discount;

      const afterDiscount = itemSubtotal - discount;
      totalTax += afterDiscount * ((item.tax || 0) / 100);
    });

    const shippingCharges = parseFloat(formData.shippingCharges) || 0;
    const grandTotal = subtotal - totalDiscount + totalTax + shippingCharges;

    return { subtotal, totalDiscount, totalTax, shippingCharges, grandTotal };
  }, [orderItems, formData.shippingCharges]);

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      setMessage({ type: "error", text: "Please select a supplier" });
      return;
    }

    if (orderItems.length === 0) {
      setMessage({ type: "error", text: "Please add at least one item" });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      supplierId: parseInt(formData.supplierId),
      shippingCharges: parseFloat(formData.shippingCharges) || 0,
      items: orderItems.map((item) => ({
        itemId: item.itemId,
        quantity: parseInt(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        discount: parseFloat(item.discount) || 0,
        discountType: item.discountType,
        tax: parseFloat(item.tax) || 0,
        notes: item.notes,
      })),
    };

    const result = await apiRequest(API_ENDPOINTS.purchaseOrders, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.success) {
      setMessage({ type: "success", text: "Purchase order created successfully!" });
      setTimeout(() => navigate("/purchases/orders"), 1500);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to create purchase order" });
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/purchases/orders")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-200">
                <FiShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Purchase Order</h1>
                <p className="text-sm text-gray-500">Create a new order for your supplier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Message */}
        {message && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiAlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Supplier & Order Info */}
        <SectionCard icon={FiHash} title="Order Information" description="Basic order details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Supplier"
              required
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.displayName || supplier.companyName}
                </option>
              ))}
            </FormSelect>

            <FormInput
              label="Order Date"
              required
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleChange}
            />

            <FormInput
              label="Expected Delivery Date"
              type="date"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleChange}
            />

            <FormInput
              label="Reference Number"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              placeholder="e.g., PO-2026-001"
            />
          </div>
        </SectionCard>

        {/* Shipping Info */}
        <SectionCard icon={FiTruck} title="Shipping Details" description="Delivery information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Shipping Method"
              name="shippingMethod"
              value={formData.shippingMethod}
              onChange={handleChange}
              placeholder="e.g., Standard, Express"
            />

            <FormInput
              label="Shipping Charges"
              type="number"
              name="shippingCharges"
              value={formData.shippingCharges}
              onChange={handleChange}
              min="0"
              step="0.01"
            />

            <div className="md:col-span-2">
              <FormTextarea
                label="Shipping Address"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                rows={3}
                placeholder="Enter delivery address"
              />
            </div>
          </div>
        </SectionCard>

        {/* Items */}
        <SectionCard
          icon={FiBox}
          title="Order Items"
          description="Add items to your order"
          action={
            <button
              type="button"
              onClick={() => setShowItemSearch(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Item
            </button>
          }
        >
          {/* Search Dropdown */}
          {showItemSearch && (
            <div className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500"
                  autoFocus
                />
              </div>
              {searchTerm && (
                <div className="mt-2 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                  {filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No items found</div>
                  ) : (
                    filteredItems.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addItem(item)}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.sku} • {item.unit}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {formatCurrency(item.costPrice)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          {orderItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiPackage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No items added yet</p>
              <p className="text-sm mt-1">Click "Add Item" to start building your order</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Item</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Unit Price</th>
                    <th className="pb-3 text-center">Discount</th>
                    <th className="pb-3 text-center">Tax %</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orderItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4">
                        <p className="font-medium text-gray-900">{item.itemName}</p>
                        <p className="text-sm text-gray-500">{item.sku}</p>
                      </td>
                      <td className="py-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:border-orange-500 focus:ring-1 focus:ring-orange-100"
                          min="1"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-right focus:border-orange-500 focus:ring-1 focus:ring-orange-100"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, "discount", parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center focus:border-orange-500 focus:ring-1 focus:ring-orange-100"
                            min="0"
                            step="0.01"
                          />
                          <select
                            value={item.discountType}
                            onChange={(e) => handleItemChange(index, "discountType", e.target.value)}
                            className="w-16 px-1 py-2 border border-gray-200 rounded-lg text-xs focus:border-orange-500"
                          >
                            <option value="percentage">%</option>
                            <option value="fixed">Rs.</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-4">
                        <input
                          type="number"
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, "tax", parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center focus:border-orange-500 focus:ring-1 focus:ring-orange-100"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-4">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          {orderItems.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col items-end gap-2">
                <div className="flex justify-between w-64 text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(totals.totalDiscount)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm">
                  <span className="text-gray-500">Tax:</span>
                  <span className="font-medium">{formatCurrency(totals.totalTax)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm">
                  <span className="text-gray-500">Shipping:</span>
                  <span className="font-medium">{formatCurrency(totals.shippingCharges)}</span>
                </div>
                <div className="flex justify-between w-64 text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-orange-600">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Notes */}
        <SectionCard icon={FiFileText} title="Additional Notes">
          <div className="grid grid-cols-1 gap-6">
            <FormTextarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional notes for this order"
            />
            <FormTextarea
              label="Terms & Conditions"
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              rows={3}
              placeholder="Payment terms, delivery conditions, etc."
            />
          </div>
        </SectionCard>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/purchases/orders")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 font-medium shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                Create Purchase Order
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPurchaseOrderPage;
