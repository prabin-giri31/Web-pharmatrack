import { API_ENDPOINTS } from "../config/api";

// Check if user is authenticated (has both user and token)
export const isAuthenticated = () => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  return user !== null && token !== null;
};

// Clear auth data (logout)
export const clearAuthData = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("rememberedEmail");
  localStorage.removeItem("rememberedPassword");
  localStorage.removeItem("globalSearch");
  localStorage.removeItem("globalSearchDraft");
};

// Get stored token
export const getToken = () => localStorage.getItem("token");

// Set token
export const setToken = (token) => localStorage.setItem("token", token);

// Get stored user
export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Set user
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Check if user has a specific role
export const hasRole = (requiredRole) => {
  const user = getUser();
  if (!user) return false;
  const userRole = (user.role || user.userType || "").toLowerCase();
  return userRole === requiredRole.toLowerCase();
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUser();
  if (!user) return false;
  const role = (user.role || user.userType || "").toLowerCase();
  return role !== "staff";
};

// Check if user is super admin
export const isSuperAdmin = () => {
  const user = getUser();
  if (!user) return false;
  const role = (user.role || user.userType || "").toLowerCase();
  return role === "super_admin";
};

// Verify token with backend
export const verifyToken = async () => {
  const token = getToken();

  if (!token || !localStorage.getItem("user")) {
    clearAuthData();
    return false;
  }

  try {
    // console.log("Verifying token:", token);
    const response = await fetch(`${API_ENDPOINTS.auth}/verify-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      // Endpoint not found, assume valid for now if we just want to bypass (Debugging)
      // OR fail if critical. Let's assume it failed.
      console.warn("Verify token endpoint not found (404).");
    }

    const data = await response.json();
    // console.log("Verify response:", data);

    if (response.ok && data.valid) {
      return true;
    } else {
      console.warn("Token validation failed:", data);
      clearAuthData();
      return false;
    }
  } catch (error) {
    console.error("Verify token error:", error);
    // Network error - clear auth and require login
    clearAuthData();
    return false;
  }
};
