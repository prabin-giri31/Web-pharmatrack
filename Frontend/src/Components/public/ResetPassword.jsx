import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import logo from "../../Images/logo.png";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { resetPasswordSchema } from "./schema/resetPasswordSchema";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const code = location.state?.code || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    // Redirect to forgot-password if no email or code provided
    if (!email || !code) {
      navigate("/forgot-password");
    }
  }, [email, code, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsNetworkError(false);
    setFieldErrors({});

    // Zod validation
    const validationResult = resetPasswordSchema.safeParse({ password, confirmPassword });
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

    const result = await apiRequest(`${API_ENDPOINTS.auth}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword: password }),
    });

    if (result.success) {
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
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
          Reset Password
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your new password below
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

        {success && (
          <div className="px-4 py-2 rounded mb-4 text-sm bg-green-100 border border-green-400 text-green-700">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <div className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:border-transparent ${
              fieldErrors.password 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-400"
            }`}>
              <FiLock className="text-gray-400 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ""});
                }}
                placeholder="New Password"
                className="w-full outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:border-transparent ${
              fieldErrors.confirmPassword 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-400"
            }`}>
              <FiLock className="text-gray-400 mr-2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors({...fieldErrors, confirmPassword: ""});
                }}
                placeholder="Confirm Password"
                className="w-full outline-none text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Password requirements hint */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
