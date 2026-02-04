import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

/**
 * Reusable Modal component
 * Handles escape key, click outside, and body scroll prevention
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  titleIcon,
  children, 
  footer,
  maxWidth = "max-w-2xl", // Tailwind max-width class
  headerColor = "blue", // "blue" | "green" | "purple" | "gray" | custom gradient class
  className = "",
}) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const headerGradients = {
    blue: "bg-gradient-to-r from-blue-600 to-blue-700",
    green: "bg-gradient-to-r from-green-600 to-green-700",
    purple: "bg-gradient-to-r from-purple-600 to-purple-700",
    gray: "bg-gray-100 border-b border-gray-200",
    indigo: "bg-gradient-to-r from-indigo-600 to-indigo-700",
    cyan: "bg-gradient-to-r from-cyan-600 to-cyan-700",
  };

  const headerBg = headerGradients[headerColor] || headerColor;
  const isLightHeader = headerColor === "gray";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} my-8 overflow-hidden ${className}`}
      >
        {/* Header */}
        {title && (
          <div className={`flex items-center justify-between px-6 py-4 ${headerBg}`}>
            <div className="flex items-center gap-3">
              {titleIcon && (
                <div className={isLightHeader ? "text-gray-700" : "text-white"}>
                  {titleIcon}
                </div>
              )}
              <h2 className={`text-xl font-semibold ${isLightHeader ? "text-gray-900" : "text-white"}`}>
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isLightHeader 
                  ? "hover:bg-gray-200 text-gray-500" 
                  : "hover:bg-white/20 text-white"
              }`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
