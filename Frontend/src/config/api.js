// API Configuration
// Change this to your backend URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Set to true to use mock data when backend is not available
const USE_MOCK_WHEN_OFFLINE = false;

// Mock data for offline development
const MOCK_DATA = {
  items: [
    { id: 1, name: "Sample Item 1", sku: "SKU001", stockOnHand: 100, reorderLevel: 10, status: "active" },
    { id: 2, name: "Sample Item 2", sku: "SKU002", stockOnHand: 50, reorderLevel: 5, status: "active" },
    { id: 3, name: "Sample Item 3", sku: "SKU003", stockOnHand: 25, reorderLevel: 15, status: "inactive" },
  ],
  inventory: {
    adjustments: [
      { id: 1, date: "2026-01-07", reason: "Stock Count", description: "Monthly inventory", status: "Completed", reference: "INV001", type: "Increase", createdBy: "Admin", createdAt: new Date(), updatedAt: new Date() },
    ],
  },
};

export const API_ENDPOINTS = {
  items: `${API_BASE_URL}/api/items`,
  auth: `${API_BASE_URL}/api/auth`,
  inventory: `${API_BASE_URL}/api/inventory`,
  customers: `${API_BASE_URL}/api/customers`,
  salesOrders: `${API_BASE_URL}/api/sales-orders`,
  invoices: `${API_BASE_URL}/api/invoices`,
  users: `${API_BASE_URL}/api/auth/users`,
  notifications: `${API_BASE_URL}/api/notifications`,
  search: `${API_BASE_URL}/api/search`,
  dashboard: `${API_BASE_URL}/api/dashboard`,
  suppliers: `${API_BASE_URL}/api/suppliers`,
  profile: `${API_BASE_URL}/api/auth/me`,
  changePassword: `${API_BASE_URL}/api/auth/change-password`,
  medicineTypes: `${API_BASE_URL}/api/medicine-types`,
  diseaseCategories: `${API_BASE_URL}/api/disease-categories`,
  itemsGroups: `${API_BASE_URL}/api/items-groups`,
  purchaseReceives: `${API_BASE_URL}/api/purchase-receives`,
  bills: `${API_BASE_URL}/api/bills`,
  payments: `${API_BASE_URL}/api/payments`,
  vendorCredits: `${API_BASE_URL}/api/vendor-credits`,
  // Super Admin endpoints
  superAdmin: {
    dashboard: `${API_BASE_URL}/api/super-admin/dashboard`,
    systemOverview: `${API_BASE_URL}/api/super-admin/system-overview`,
    users: `${API_BASE_URL}/api/super-admin/users`,
    pendingUsers: `${API_BASE_URL}/api/super-admin/users/pending`,
    activities: `${API_BASE_URL}/api/super-admin/activities`,
    loginHistory: `${API_BASE_URL}/api/super-admin/activities/login-history`,
    suspiciousActivities: `${API_BASE_URL}/api/super-admin/activities/suspicious`,
    activityStats: `${API_BASE_URL}/api/super-admin/activities/stats`,
    settings: `${API_BASE_URL}/api/super-admin/settings`,
    dataExport: `${API_BASE_URL}/api/super-admin/data/export`,
    backup: `${API_BASE_URL}/api/super-admin/data/backup`,
    reports: `${API_BASE_URL}/api/super-admin/reports/summary`,
  },
};

// Helper function for API calls with better error handling
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("token")
          ? { "Authorization": `Bearer ${localStorage.getItem("token")}` }
          : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    // Check if it's a network error (backend not running)
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      // Return mock data if enabled
      if (USE_MOCK_WHEN_OFFLINE) {
        const mockData = getMockDataForUrl(url, options.method);
        if (mockData !== null) {
          console.warn("⚠️ Using mock data - Backend not connected");
          return { success: true, data: mockData, isMock: true };
        }
      }

      return {
        success: false,
        error: "Cannot connect to server. Please make sure the backend is running.",
        isNetworkError: true,
      };
    }

    return {
      success: false,
      error: error.message || "Something went wrong",
      isNetworkError: false,
    };
  }
};

// Get mock data based on URL
const getMockDataForUrl = (url, method = "GET") => {
  if (method !== "GET") return null; // Only mock GET requests

  if (url.includes("/api/items")) {
    return MOCK_DATA.items;
  }
  if (url.includes("/api/inventory/adjustments")) {
    return MOCK_DATA.inventory.adjustments;
  }
  return null;
};

export default API_BASE_URL;
