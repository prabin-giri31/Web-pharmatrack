/**
 * Utility functions for formatting data
 * Reusable across all components
 */

/**
 * Format date to localized string
 * @param {string|Date} dateString - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "-";
  
  const defaultOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  };
  
  try {
    return new Date(dateString).toLocaleDateString("en-US", defaultOptions);
  } catch {
    return "-";
  }
};

/**
 * Format date with time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  
  try {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: NPR)
 * @param {string} locale - Locale for formatting (default: en-NP)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "NPR", locale = "en-NP") => {
  if (amount === null || amount === undefined) return "-";
  
  const num = parseFloat(amount) || 0;
  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${currency} ${formatted}`;
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return "-";
  
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Format status text (snake_case to Title Case)
 * @param {string} status - Status string
 * @returns {string} Formatted status string
 */
export const formatStatus = (status) => {
  if (!status) return "-";
  return status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns {string} Today's date
 */
export const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Get future date in ISO format
 * @param {number} days - Days to add
 * @returns {string} Future date
 */
export const getFutureDate = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatStatus,
  getTodayDate,
  getFutureDate,
  calculatePercentage,
  truncateText,
};
