import { useState } from "react";
import { FiUser, FiMail, FiPhone, FiLock, FiCheck, FiX, FiMapPin, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../../Images/logo.png";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

// Password validation helper
const validatePassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
};

const isPasswordValid = (password) => {
  const validation = validatePassword(password);
  return Object.values(validation).every(Boolean);
};

// Phone validation for Nepal (+977 followed by 10 digits)
const validatePhone = (phone) => {
  return /^\+977\d{10}$/.test(phone);
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pharmacyName: "",
    ownerName: "",
    email: "",
    phone: "",
    registrationNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const passwordValidation = validatePassword(form.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.pharmacyName.trim()) {
      errors.pharmacyName = "Pharmacy name is required";
    }

    if (!form.ownerName.trim()) {
      errors.ownerName = "Owner/Full name is required";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(form.phone)) {
      errors.phone = "Phone must start with +977 and contain exactly 10 digits (e.g., +9779812345678)";
    }

    if (!form.registrationNumber.trim()) {
      errors.registrationNumber = "Pharmacy registration number is required";
    }

    if (!form.address.trim()) {
      errors.address = "Pharmacy address is required";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (!isPasswordValid(form.password)) {
      errors.password = "Password does not meet requirements";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!form.agreeTerms) {
      errors.agreeTerms = "You must agree to the terms and conditions";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsNetworkError(false);
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the validation errors");
      return;
    }

    setLoading(true);

    const result = await apiRequest(`${API_ENDPOINTS.auth}/register`, {
      method: "POST",
      body: JSON.stringify({
        pharmacyName: form.pharmacyName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        registrationNumber: form.registrationNumber,
        address: form.address,
        password: form.password,
      }),
    });

    if (result.success) {
      // Registration successful, redirect to login
      navigate("/login");
    } else {
      setError(result.error);
      setIsNetworkError(result.isNetworkError);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Pharmacy Registration
        </h2>

        {error && (
          <div className={`px-4 py-2 rounded mb-4 text-sm ${
            isNetworkError 
              ? "bg-yellow-50 border border-yellow-400 text-yellow-700" 
              : "bg-red-100 border border-red-400 text-red-700"
          }`}>
            {isNetworkError && "⚠️ "}{error}
          </div>
        )}

        <div className="space-y-4">

          {/* Pharmacy Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pharmacy Name <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ${
              fieldErrors.pharmacyName 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-500"
            }`}>
              <FiFileText className="text-gray-400 mr-2" />
              <input
                type="text"
                name="pharmacyName"
                placeholder="Enter pharmacy name"
                value={form.pharmacyName}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.pharmacyName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.pharmacyName}</p>
            )}
          </div>

          {/* Owner / Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner / Full Name <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ${
              fieldErrors.ownerName 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-500"
            }`}>
              <FiUser className="text-gray-400 mr-2" />
              <input
                type="text"
                name="ownerName"
                placeholder="Enter owner's full name"
                value={form.ownerName}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.ownerName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.ownerName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ${
              fieldErrors.email 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-500"
            }`}>
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ${
              fieldErrors.phone 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-500"
            }`}>
              <FiPhone className="text-gray-400 mr-2" />
              <input
                type="tel"
                name="phone"
                placeholder="+9779812345678"
                value={form.phone}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">Format: +977 followed by 10 digits</p>
          </div>

          {/* Pharmacy Registration Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pharmacy Registration Number <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ${
              fieldErrors.registrationNumber 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-500"
            }`}>
              <FiFileText className="text-gray-400 mr-2" />
              <input
                type="text"
                name="registrationNumber"
                placeholder="Enter registration number"
                value={form.registrationNumber}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.registrationNumber && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.registrationNumber}</p>
            )}
          </div>

          {/* Pharmacy Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pharmacy Address <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ${
              fieldErrors.address 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-500"
            }`}>
              <FiMapPin className="text-gray-400 mr-2" />
              <input
                type="text"
                name="address"
                placeholder="Enter pharmacy address"
                value={form.address}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.address && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Create Password <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ${
              fieldErrors.password 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-500"
            }`}>
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setShowPasswordRules(true)}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
            )}
            
            {/* Password Requirements */}
            {showPasswordRules && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs space-y-1">
                <p className="font-medium text-gray-600 mb-2">Password must have:</p>
                <PasswordRule valid={passwordValidation.length} text="At least 8 characters" />
                <PasswordRule valid={passwordValidation.uppercase} text="At least one uppercase letter (A-Z)" />
                <PasswordRule valid={passwordValidation.lowercase} text="At least one lowercase letter (a-z)" />
                <PasswordRule valid={passwordValidation.number} text="At least one number (0-9)" />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ${
              fieldErrors.confirmPassword 
                ? "border-red-400 focus-within:ring-red-400" 
                : "border-gray-300 focus-within:ring-blue-500"
            }`}>
              <FiLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full outline-none text-gray-700"
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Agreement */}
          <div>
            <label className={`flex items-start text-sm ${fieldErrors.agreeTerms ? "text-red-600" : "text-gray-700"}`}>
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
                className="mr-2 mt-1"
              />
              <span>
                I agree to the{" "}
                <span className="text-blue-600 hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-blue-600 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </span>
            </label>
            {fieldErrors.agreeTerms && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.agreeTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register Pharmacy"}
          </button>

        </div>

        {/* Already have an account */}
        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <span 
            onClick={() => navigate("/login")}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

// Password rule component
const PasswordRule = ({ valid, text }) => (
  <div className={`flex items-center gap-2 ${valid ? "text-green-600" : "text-gray-500"}`}>
    {valid ? <FiCheck className="w-3 h-3" /> : <FiX className="w-3 h-3" />}
    <span>{text}</span>
  </div>
);

export default RegisterPage;