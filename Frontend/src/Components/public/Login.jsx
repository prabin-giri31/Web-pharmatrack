import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../Images/logo.png";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { loginSchema } from "./schema/loginSchema";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [enableAutoFill, setEnableAutoFill] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Load remembered email ONLY (not password)
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    if (!checked) {
      localStorage.removeItem("rememberedEmail");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsNetworkError(false);
    setFieldErrors({});

    // Zod validation
    const validationResult = loginSchema.safeParse({ email, password });
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

    const result = await apiRequest(`${API_ENDPOINTS.auth}/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.success) {
      // Remember email only (secure)
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      localStorage.setItem("user", JSON.stringify(result.data.data));
      localStorage.setItem("token", result.data.token);

      // Update state to trigger re-render of App component (or simple navigate)
      // Since App checks token on mount, we might need to force update or just navigate
      // Because we just set the token, navigate should work if the PrivateRoute checks token from localStorage
      navigate("/items");
      // Force a reload if necessary to update auth state in App, but let's try navigate first.
      // Better yet, we can simple trigger a window reload if the App state doesn't update automatically
      window.location.href = "/items";
    } else {
      setError(result.error);
      setIsNetworkError(result.isNetworkError);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Login
        </h2>

        {error && (
          <div
            className={`px-4 py-2 rounded mb-4 text-sm ${isNetworkError
                ? "bg-yellow-50 border border-yellow-400 text-yellow-700"
                : "bg-red-100 border border-red-400 text-red-700"
              }`}
          >
            {isNetworkError && "⚠️ "}
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onFocus={() => setEnableAutoFill(true)} // 🔑 enable autofill on click
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="Enter your email"
              autoComplete={enableAutoFill ? "username" : "off"}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              placeholder="Enter your password"
              autoComplete={enableAutoFill ? "current-password" : "off"}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.password
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                }`}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span>Remember me</span>
            </label>

            <span
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Forgot Password?
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg
                       font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
