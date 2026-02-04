import React from "react";
import { statusCardColors } from "../../utils/statusStyles";

/**
 * Reusable Status Card component for displaying counts with colored backgrounds
 * Can be used for order status, inventory status, etc.
 */
const StatusCard = ({ 
  label, 
  count, 
  active = false, 
  onClick, 
  color = "blue",
  icon,
  className = "",
}) => {
  const colorConfig = statusCardColors[color] || statusCardColors.blue;
  const state = active ? colorConfig.active : colorConfig.inactive;

  return (
    <button
      onClick={onClick}
      className={`${state.bg} ${state.text} rounded-xl p-3 text-left transition-all duration-200 hover:shadow-md ${className}`}
    >
      {icon && <div className="mb-1">{icon}</div>}
      <p className="text-xs font-medium">{label}</p>
      <p className="text-xl font-bold mt-1">{count}</p>
    </button>
  );
};

export default StatusCard;
