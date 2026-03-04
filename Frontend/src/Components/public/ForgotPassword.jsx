import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import logo from "../../Images/logo.png";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { forgotPasswordSchema } from "./schema/forgotPasswordSchema";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsNetworkError(false);
    setFieldErrors({});

    // Zod validation
    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      const errors = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0]] = err.message;
        }
      });
      setFieldErrors(errors);
      setError("Please fix the validation errors");
      return;
    }

    setLoading(true);

    const result = await apiRequest(`${API_ENDPOINTS.auth}/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (result.success) {
      // Navigate to code verification page
      navigate("/verify-reset-code", { 
        state: { email } 
      });
    } else {
      setError(result.error);
      setIsNetworkError(result.isNetworkError);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center bg-gray-100">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className={`px-4 py-2 rounded mb-4 text-sm ${
            isNetworkError 
              ? "bg-yellow-50 border border-yellow-400 text-yellow-700" 
              : "bg-red-100 border border-red-400 text-red-700"
          }`}>
            {isNetworkError && "⚠️ "}{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:border-transparent ${
              fieldErrors.email 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-400"
            }`}>
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({});
                }}
                placeholder="Enter your email"
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-center gap-2 w-full mt-4 text-gray-600 hover:text-gray-800 transition"
        >
          <FiArrowLeft size={16} />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
