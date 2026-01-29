import React from "react";
import { FiDollarSign } from "react-icons/fi";

const OrderSummary = ({
  subtotal,
  totalDiscount,
  totalTax,
  shippingCharges,
  adjustment,
  grandTotal,
  discountType,
  discountValue,
  onDiscountTypeChange,
  onDiscountValueChange,
  onShippingChange,
  onAdjustmentChange,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(amount);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
        <FiDollarSign className="w-4 h-4" />
        Order Summary
      </h3>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>

        {/* Discount */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Discount</span>
          <div className="flex items-center gap-2">
            {onDiscountTypeChange && onDiscountValueChange ? (
              <>
                <select
                  value={discountType}
                  onChange={(e) => onDiscountTypeChange(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="percent">%</option>
                  <option value="amount">NPR</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max={discountType === "amount" ? undefined : 100}
                  value={discountValue}
                  onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-right border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            ) : null}
            <span className="font-medium text-red-600">-{formatCurrency(totalDiscount)}</span>
          </div>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">{formatCurrency(totalTax)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3"></div>

        {/* Shipping Charges */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Shipping Charges</span>
          <div className="relative w-28">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">NPR</span>
            <input
              type="number"
              value={shippingCharges}
              onChange={(e) => onShippingChange(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Adjustment */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Adjustment</span>
          <div className="relative w-28">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">NPR</span>
            <input
              type="number"
              value={adjustment}
              onChange={(e) => onAdjustmentChange(parseFloat(e.target.value) || 0)}
              step="0.01"
              className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3"></div>

        {/* Grand Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Grand Total</span>
          <span className="text-2xl font-bold text-blue-600">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
