import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

/**
 * Reusable Search Input component
 */
const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search...",
  className = "",
  showClear = true,
  size = "default", // "small" | "default" | "large"
}) => {
  const sizeClasses = {
    small: "py-2 pl-9 pr-4 text-sm",
    default: "py-2.5 pl-10 pr-4",
    large: "py-3 pl-11 pr-4 text-lg",
  };

  const iconSizeClasses = {
    small: "w-4 h-4 left-2.5",
    default: "w-5 h-5 left-3",
    large: "w-6 h-6 left-3.5",
  };

  return (
    <div className={`relative ${className}`}>
      <FiSearch className={`absolute ${iconSizeClasses[size]} top-1/2 -translate-y-1/2 text-gray-400`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${sizeClasses[size]} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
      />
      {showClear && value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
