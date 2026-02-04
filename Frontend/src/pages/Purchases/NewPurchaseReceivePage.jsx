import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import {
  FiTruck,
  FiChevronLeft,
  FiCheck,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiCalendar,
  FiUser,
  FiMapPin,
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
          : "border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 hover:border-gray-300"
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
          : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 hover:border-gray-300"
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
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white transition-all duration-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 hover:border-gray-300 resize-none"
    />
  </div>
);

const SectionCard = ({ icon: Icon, title, description, children, action }) => (
  <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Icon className="w-5 h-5 text-indigo-600" />
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

const NewPurchaseReceivePage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showItemSearch, setShowItemSearch] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    receiveDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    deliveryMethod: "",
    trackingNumber: "",
    receivedBy: "",
    warehouseLocation: "",
    notes: "",
  });

  const [receiveItems, setReceiveItems] = useState([]);

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
    setReceiveItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        
        // Recalculate total
        const subtotal = (updated.receivedQuantity || 0) * (updated.unitPrice || 0);
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
    const exists = receiveItems.find((ri) => ri.itemId === item.id);
    if (exists) {
      setMessage({ type: "error", text: "Item already added" });
      return;
    }

    setReceiveItems((prev) => [
      ...prev,
      {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        unit: item.unit,
        receivedQuantity: 1,
        unitPrice: item.sellingPrice || item.costPrice || 0,
        discount: 0,
        discountType: "percentage",
        tax: 13,
        total: 0,
        batchNumber: "",
        expiryDate: "",
        manufacturingDate: "",
        notes: "",
      },
    ]);
    setShowItemSearch(false);
    setSearchTerm("");
  };

  const removeItem = (index) => {
    setReceiveItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.sku?.toLowerCase().includes(search)
    );
  });

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    receiveItems.forEach((item) => {
      const itemSubtotal = (item.receivedQuantity || 0) * (item.unitPrice || 0);
      let discount = 0;
      if (item.discountType === "percentage") {
        discount = itemSubtotal * ((item.discount || 0) / 100);
      } else {
        discount = item.discount || 0;
      }
      const afterDiscount = itemSubtotal - discount;
      const tax = afterDiscount * ((item.tax || 0) / 100);

      subtotal += itemSubtotal;
      totalDiscount += discount;
      totalTax += tax;
    });

    return {
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal: subtotal - totalDiscount + totalTax,
    };
  }, [receiveItems]);

  const errors = useMemo(() => {
    const errs = {};
    if (!formData.supplierId) errs.supplierId = "Supplier is required";
    if (!formData.receiveDate) errs.receiveDate = "Date is required";
    if (receiveItems.length === 0) errs.items = "At least one item is required";
    return errs;
  }, [formData.supplierId, formData.receiveDate, receiveItems.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (Object.keys(errors).length) {
      setMessage({ type: "error", text: "Please fill all required fields and add at least one item." });
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      items: receiveItems.map((item) => ({
        itemId: item.itemId,
        receivedQuantity: parseInt(item.receivedQuantity),
        unitPrice: parseFloat(item.unitPrice),
        discount: parseFloat(item.discount || 0),
        discountType: item.discountType,
        tax: parseFloat(item.tax || 0),
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate || null,
        manufacturingDate: item.manufacturingDate || null,
        notes: item.notes,
      })),
    };

    const result = await apiRequest(API_ENDPOINTS.purchaseReceives, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.success) {
      navigate("/purchases/receives", { state: { message: "Purchase receive created successfully" } });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to create purchase receive" });
    }
    setSaving(false);
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/purchases/receives")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                  <FiTruck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Purchase Receive</h1>
                  <p className="text-sm text-gray-500">Record incoming inventory from suppliers</p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/purchases/receives")}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="receive-form"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-200 font-medium transition-all disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Save Receive
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alert Messages */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 border shadow-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
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

        <form id="receive-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier & Date */}
          <SectionCard
            icon={FiUser}
            title="Supplier Information"
            description="Select the vendor and receive date"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormSelect
                label="Supplier"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required
                error={errors.supplierId}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.displayName || supplier.companyName}
                  </option>
                ))}
              </FormSelect>

              <FormInput
                label="Receive Date"
                name="receiveDate"
                type="date"
                value={formData.receiveDate}
                onChange={handleChange}
                required
                error={errors.receiveDate}
              />

              <FormInput
                label="Reference Number"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="PO number, invoice ref, etc."
              />
            </div>
          </SectionCard>

          {/* Shipping Details */}
          <SectionCard
            icon={FiMapPin}
            title="Delivery Details"
            description="Shipping and tracking information"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <FormInput
                label="Delivery Method"
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleChange}
                placeholder="e.g., Courier, Self pickup"
              />

              <FormInput
                label="Tracking Number"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                placeholder="Tracking ID"
              />

              <FormInput
                label="Received By"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleChange}
                placeholder="Person who received"
              />

              <FormInput
                label="Warehouse Location"
                name="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={handleChange}
                placeholder="Storage location"
              />
            </div>
          </SectionCard>

          {/* Items */}
          <SectionCard
            icon={FiPackage}
            title="Received Items"
            description="Add items being received"
            action={
              <button
                type="button"
                onClick={() => setShowItemSearch(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" /> Add Item
              </button>
            }
          >
            {/* Item Search Modal */}
            {showItemSearch && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Select Item</h3>
                      <button
                        type="button"
                        onClick={() => { setShowItemSearch(false); setSearchTerm(""); }}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <FiAlertCircle className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto">
                    {filteredItems.length ? (
                      filteredItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addItem(item)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 text-left transition-colors"
                        >
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <FiBox className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.sku} • {item.unit || "pcs"}</p>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            Stock: {item.stockOnHand || 0}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">No items found</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            {receiveItems.length > 0 ? (
              <div className="space-y-4">
                {receiveItems.map((item, index) => (
                  <div
                    key={`item-${index}`}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <FiBox className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.itemName}</p>
                          <p className="text-sm text-gray-500">{item.sku} • {item.unit || "pcs"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(item.total || 0)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <FormInput
                        label="Quantity"
                        type="number"
                        min="1"
                        value={item.receivedQuantity}
                        onChange={(e) => handleItemChange(index, "receivedQuantity", e.target.value)}
                      />
                      <FormInput
                        label="Unit Price"
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                      />
                      <FormInput
                        label="Discount"
                        type="number"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                      />
                      <FormSelect
                        label="Disc. Type"
                        value={item.discountType}
                        onChange={(e) => handleItemChange(index, "discountType", e.target.value)}
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">Fixed</option>
                      </FormSelect>
                      <FormInput
                        label="Tax %"
                        type="number"
                        step="0.01"
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, "tax", e.target.value)}
                      />
                      <FormInput
                        label="Batch #"
                        value={item.batchNumber}
                        onChange={(e) => handleItemChange(index, "batchNumber", e.target.value)}
                        placeholder="Batch"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <FormInput
                        label="Manufacturing Date"
                        type="date"
                        value={item.manufacturingDate}
                        onChange={(e) => handleItemChange(index, "manufacturingDate", e.target.value)}
                      />
                      <FormInput
                        label="Expiry Date"
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => handleItemChange(index, "expiryDate", e.target.value)}
                      />
                      <FormInput
                        label="Notes"
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                        placeholder="Item notes"
                      />
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Discount</span>
                      <span className="font-medium text-red-600">- {formatCurrency(totals.totalDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Tax</span>
                      <span className="font-medium text-gray-900">{formatCurrency(totals.totalTax)}</span>
                    </div>
                    <div className="border-t border-indigo-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                        <span className="text-xl font-bold text-indigo-600">{formatCurrency(totals.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No items added yet</p>
                <button
                  type="button"
                  onClick={() => setShowItemSearch(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add First Item
                </button>
              </div>
            )}
            {errors.items && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.items}
              </p>
            )}
          </SectionCard>

          {/* Notes */}
          <SectionCard
            icon={FiFileText}
            title="Additional Notes"
            description="Any remarks or special instructions"
          >
            <FormTextarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Add any additional notes about this purchase receive..."
            />
          </SectionCard>

          {/* Mobile Submit Buttons */}
          <div className="sm:hidden flex items-center gap-3 sticky bottom-4">
            <button
              type="button"
              onClick={() => navigate("/purchases/receives")}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-medium shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Receive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPurchaseReceivePage;
