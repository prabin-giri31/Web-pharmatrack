import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiTrash2, FiSearch, FiAlertTriangle, FiPackage } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../../config/api";

// Dummy products data
const dummyProducts = [
  { id: 1, name: "Paracetamol 500mg", sku: "MED001", unit: "Box", rate: 12.50, stock: 500, tax: 5, description: "Pain relief medication - 100 tablets per box" },
  { id: 2, name: "Ibuprofen 400mg", sku: "MED002", unit: "Box", rate: 15.00, stock: 350, tax: 5, description: "Anti-inflammatory medication - 50 tablets per box" },
  { id: 3, name: "Amoxicillin 250mg", sku: "MED003", unit: "Strip", rate: 8.75, stock: 200, tax: 5, description: "Antibiotic - 10 capsules per strip" },
  { id: 4, name: "Vitamin C 1000mg", sku: "SUP001", unit: "Bottle", rate: 22.00, stock: 150, tax: 8, description: "Immune support supplement - 60 tablets" },
  { id: 5, name: "Omega-3 Fish Oil", sku: "SUP002", unit: "Bottle", rate: 35.00, stock: 80, tax: 8, description: "Heart health supplement - 90 softgels" },
  { id: 6, name: "Blood Pressure Monitor", sku: "EQP001", unit: "Piece", rate: 89.99, stock: 25, tax: 12, description: "Digital automatic blood pressure monitor" },
  { id: 7, name: "Digital Thermometer", sku: "EQP002", unit: "Piece", rate: 15.99, stock: 100, tax: 12, description: "Instant read digital thermometer" },
  { id: 8, name: "First Aid Kit", sku: "EQP003", unit: "Kit", rate: 45.00, stock: 40, tax: 12, description: "Complete first aid kit - 50 pieces" },
  { id: 9, name: "Bandages (Pack of 50)", sku: "SUP003", unit: "Pack", rate: 8.00, stock: 300, tax: 5, description: "Sterile adhesive bandages - assorted sizes" },
  { id: 10, name: "Hand Sanitizer 500ml", sku: "HYG001", unit: "Bottle", rate: 6.50, stock: 450, tax: 8, description: "Antibacterial hand sanitizer gel" },
];

const ItemTable = ({ items, onItemsChange, products: productsProp }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState(productsProp || []);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setProductSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (productsProp) {
      setProducts(productsProp);
    }
  }, [productsProp]);

  useEffect(() => {
    if (productsProp) return;
    const fetchProducts = async () => {
      const result = await apiRequest(API_ENDPOINTS.items);
      if (result.success) {
        const normalized = (result.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku || "",
          unit: item.unit || "",
          rate: Number(item.sellingPrice || 0),
          stock: item.stockOnHand ?? 0,
          tax: Number(item.tax || 0),
          description: item.description || "",
        }));
        setProducts(normalized);
      }
    };
    fetchProducts();
  }, [productsProp]);

  const productSource = products.length ? products : dummyProducts;

  const filteredProducts = productSource.filter(
    (product) =>
      (product.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.sku || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const getDiscountAmount = (subtotal, discount, discountType) => {
    if (!discount) return 0;
    if (discountType === "amount") {
      return Math.min(discount, subtotal);
    }
    return (subtotal * discount) / 100;
  };

  const calculateLineTotal = (item) => {
    if (!item.productId) return 0;
    const subtotal = item.quantity * item.rate;
    const discountAmount = getDiscountAmount(subtotal, item.discount, item.discountType);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * item.tax) / 100;
    return afterDiscount + taxAmount;
  };

  const handleProductSelect = (index, product) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      product: product,
      description: product.description,
      rate: product.rate,
      tax: product.tax,
      quantity: 1,
      discount: 0,
      discountType: "percent",
    };
    onItemsChange(newItems);
    setActiveDropdown(null);
    setProductSearch("");
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "description" || field === "discountType") {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = parseFloat(value) || 0;
    }
    onItemsChange(newItems);
  };

  const handleAddRow = () => {
    onItemsChange([
      ...items,
      {
        id: Date.now(),
        productId: null,
        product: null,
        description: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        discountType: "percent",
        tax: 0,
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (items.length === 1) {
      // Reset the single row instead of removing
      onItemsChange([
        {
          id: Date.now(),
          productId: null,
          product: null,
          description: "",
          quantity: 1,
          rate: 0,
          discount: 0,
          discountType: "percent",
          tax: 0,
        },
      ]);
    } else {
      const newItems = items.filter((_, i) => i !== index);
      onItemsChange(newItems);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="col-span-3">Item Details</div>
          <div className="col-span-2">Description</div>
          <div className="col-span-1 text-center">Qty</div>
          <div className="col-span-1 text-right">Rate</div>
          <div className="col-span-1 text-center">Disc</div>
          <div className="col-span-1 text-center">Tax %</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-start hover:bg-gray-50">
            {/* Item Selector */}
            <div className="col-span-3 relative" ref={activeDropdown === index ? dropdownRef : null}>
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                className={`w-full text-left px-3 py-2 border rounded-lg transition-all ${
                  item.productId
                    ? "border-gray-300 bg-white"
                    : "border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                {item.product ? (
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Select an item</span>
                )}
              </button>

              {/* Product Dropdown */}
              {activeDropdown === index && (
                <div className="absolute z-30 w-80 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleProductSelect(index, product)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left"
                        >
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku} • {product.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">{formatCurrency(product.rate)}</p>
                            <p className={`text-xs ${product.stock < 20 ? "text-red-600" : "text-green-600"}`}>
                              Stock: {product.stock}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No products found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stock Warning */}
              {item.product && item.quantity > item.product.stock && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <FiAlertTriangle className="w-3 h-3" />
                  <span>Only {item.product.stock} in stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <textarea
                value={item.description}
                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Quantity */}
            <div className="col-span-1">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                min="1"
                className={`w-full px-2 py-2 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  item.product && item.quantity > item.product.stock
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              />
            </div>

            {/* Rate */}
            <div className="col-span-1">
              <input
                type="number"
                value={item.rate}
                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Discount */}
            <div className="col-span-1">
              <div className="flex items-center gap-2">
                <select
                  value={item.discountType || "percent"}
                  onChange={(e) => handleItemChange(index, "discountType", e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tax */}
            <div className="col-span-1">
              <input
                type="number"
                value={item.tax}
                onChange={(e) => handleItemChange(index, "tax", e.target.value)}
                min="0"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Line Total */}
            <div className="col-span-2 text-right py-2">
              <span className="font-semibold text-gray-900">
                {formatCurrency(calculateLineTotal(item))}
              </span>
            </div>

            {/* Remove Button */}
            <div className="col-span-1 text-center py-2">
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Another Item
        </button>
      </div>
    </div>
  );
};

export { ItemTable, dummyProducts };
export default ItemTable;
