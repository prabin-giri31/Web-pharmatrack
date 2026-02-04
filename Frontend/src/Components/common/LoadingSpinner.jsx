import React from "react";
import { FiLoader } from "react-icons/fi";

/**
 * Reusable Loading Spinner component
 */
const LoadingSpinner = ({ 
  size = "default", // "small" | "default" | "large"
  message = "Loading...",
  showMessage = true,
  className = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    small: "w-5 h-5",
    default: "w-10 h-10",
    large: "w-16 h-16",
  };

  const content = (
    <div className={`text-center ${className}`}>
      <FiLoader className={`${sizeClasses[size]} text-blue-600 animate-spin mx-auto mb-4`} />
      {showMessage && <p className="text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
