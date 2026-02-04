import React from "react";

/**
 * Reusable Empty State component
 */
const EmptyState = ({ 
  icon,
  title = "No data found",
  description = "Try adjusting your filters or adding new items.",
  action,
  actionLabel = "Add New",
  onAction,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action || (onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      ))}
    </div>
  );
};

export default EmptyState;
