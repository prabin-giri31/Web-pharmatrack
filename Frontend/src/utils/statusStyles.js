/**
 * Centralized status styles configuration
 * Reusable across all components for consistent UI
 */

// Order status badge styles
export const orderStatusStyles = {
  draft: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    activeBg: "bg-gray-600",
    activeText: "text-white",
    icon: "📝",
  },
  confirmed: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
    activeBg: "bg-indigo-600",
    activeText: "text-white",
    icon: "✓",
  },
  processing: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    activeBg: "bg-blue-600",
    activeText: "text-white",
    icon: "⚙️",
  },
  shipped: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-200",
    activeBg: "bg-cyan-600",
    activeText: "text-white",
    icon: "🚚",
  },
  delivered: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    activeBg: "bg-green-600",
    activeText: "text-white",
    icon: "✅",
  },
  invoiced: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    activeBg: "bg-purple-600",
    activeText: "text-white",
    icon: "📄",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    activeBg: "bg-red-600",
    activeText: "text-white",
    icon: "❌",
  },
  completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    activeBg: "bg-emerald-600",
    activeText: "text-white",
    icon: "🏁",
  },
};

// Payment status badge styles
export const paymentStatusStyles = {
  unpaid: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  partially_paid: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  paid: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  overdue: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
  refunded: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

// Stock status styles
export const stockStatusStyles = {
  inStock: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  lowStock: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  outOfStock: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
};

// Color palette for status cards
export const statusCardColors = {
  blue: {
    inactive: { bg: "bg-blue-50", text: "text-blue-700" },
    active: { bg: "bg-blue-600", text: "text-white" },
  },
  gray: {
    inactive: { bg: "bg-gray-100", text: "text-gray-700" },
    active: { bg: "bg-gray-600", text: "text-white" },
  },
  indigo: {
    inactive: { bg: "bg-indigo-50", text: "text-indigo-700" },
    active: { bg: "bg-indigo-600", text: "text-white" },
  },
  green: {
    inactive: { bg: "bg-green-50", text: "text-green-700" },
    active: { bg: "bg-green-600", text: "text-white" },
  },
  purple: {
    inactive: { bg: "bg-purple-50", text: "text-purple-700" },
    active: { bg: "bg-purple-600", text: "text-white" },
  },
  red: {
    inactive: { bg: "bg-red-50", text: "text-red-700" },
    active: { bg: "bg-red-600", text: "text-white" },
  },
  yellow: {
    inactive: { bg: "bg-yellow-50", text: "text-yellow-700" },
    active: { bg: "bg-yellow-600", text: "text-white" },
  },
  cyan: {
    inactive: { bg: "bg-cyan-50", text: "text-cyan-700" },
    active: { bg: "bg-cyan-600", text: "text-white" },
  },
};

/**
 * Get status badge class string
 * @param {string} status - Status key
 * @param {object} styleMap - Style mapping object
 * @returns {string} CSS class string
 */
export const getStatusBadgeClass = (status, styleMap = orderStatusStyles) => {
  const style = styleMap[status] || styleMap.draft || {};
  return `${style.bg || ""} ${style.text || ""} ${style.border ? `border ${style.border}` : ""}`.trim();
};

/**
 * Get status card class string
 * @param {string} color - Color name
 * @param {boolean} isActive - Whether the card is active
 * @returns {string} CSS class string
 */
export const getStatusCardClass = (color, isActive = false) => {
  const colorStyle = statusCardColors[color] || statusCardColors.blue;
  const state = isActive ? colorStyle.active : colorStyle.inactive;
  return `${state.bg} ${state.text}`;
};

export default {
  orderStatusStyles,
  paymentStatusStyles,
  stockStatusStyles,
  statusCardColors,
  getStatusBadgeClass,
  getStatusCardClass,
};
