import React from "react";

/**
 * Reusable Error State component
 */
const ErrorState = ({ 
  icon,
  title = "Something went wrong",
  message = "An error occurred. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
