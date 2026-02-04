import React from "react";
import { orderStatusStyles, paymentStatusStyles, getStatusBadgeClass } from "../../utils/statusStyles";
import { formatStatus } from "../../utils/formatters";

/**
 * Reusable Badge component for displaying status
 * Can be used for order status, payment status, stock status, etc.
 */
const StatusBadge = ({ 
  status, 
  type = "order", // "order" | "payment" | "custom"
  customStyles = null,
  className = "",
  size = "default", // "small" | "default" | "large"
}) => {
  // Get styles based on type
  const getStyles = () => {
    if (customStyles) return getStatusBadgeClass(status, customStyles);
    
    switch (type) {
      case "payment":
        return getStatusBadgeClass(status, paymentStatusStyles);
      case "order":
      default:
        return getStatusBadgeClass(status, orderStatusStyles);
    }
  };

  // Size classes
  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    default: "px-3 py-1 text-xs",
    large: "px-4 py-2 text-sm",
  };

  return (
    <span
      className={`inline-flex font-medium rounded-full capitalize ${getStyles()} ${sizeClasses[size]} ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
