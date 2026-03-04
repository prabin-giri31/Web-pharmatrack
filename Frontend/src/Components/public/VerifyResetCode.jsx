import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import logo from "../../Images/logo.png";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { forgotPasswordSchema } from "./schema/forgotPasswordSchema";

const VerifyResetCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Redirect to forgot-password if no email provided
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    
    // Focus the appropriate input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsNetworkError(false);

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    const result = await apiRequest(`${API_ENDPOINTS.auth}/verify-reset-code`, {
      method: "POST",
      body: JSON.stringify({ email, code: fullCode }),
    });

    if (result.success) {
      // Navigate to reset password page with email and code
      navigate("/reset-password", { 
        state: { email, code: fullCode },
        replace: true 
      });
    } else {
      setError(result.error);
      setIsNetworkError(result.isNetworkError);
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setIsNetworkError(false);

    // Zod validation for email
    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      setError(validationResult.error.issues[0]?.message || "Invalid email");
      return;
    }

    setLoading(true);

    const result = await apiRequest(`${API_ENDPOINTS.auth}/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (result.success) {
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setSuccess("A new code has been sent to your email.");
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
          Enter Verification Code
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6-digit code input */}
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
            >
              Resend
            </button>
          </p>
        </div>

        <button
          onClick={() => navigate("/forgot-password")}
          className="flex items-center justify-center gap-2 w-full mt-4 text-gray-600 hover:text-gray-800 transition"
        >
          <FiArrowLeft size={16} />
          Back
        </button>
      </div>
    </div>
  );
};

export default VerifyResetCode;
