import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiTrendingUp,
  FiAlertTriangle,
  FiFileText,
  FiUsers,
  FiShoppingCart,
  FiPlus,
  FiTruck,
  FiBarChart2,
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiPackage,
  FiRefreshCw,
  FiChevronRight,
  FiBell,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { getUser } from "../../utils/auth";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await apiRequest(`${API_ENDPOINTS.dashboard}/summary`);
    if (result.success) {
      setDashboard(result.data);
    } else {
      setError(result.error || "Failed to load dashboard");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const storedUser = getUser();
    setUser(storedUser);
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `Rs. ${num.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "-";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Quick Actions
  const quickActions = [
    {
      label: "Add Medicine",
      icon: FiPlus,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => navigate("/items/new"),
    },
    {
      label: "Create Invoice",
      icon: FiFileText,
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => navigate("/sales/invoices/new"),
    },
    {
      label: "Add Vendor",
      icon: FiTruck,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => navigate("/purchases/suppliers/new"),
    },
    {
      label: "Record Purchase",
      icon: FiShoppingCart,
      color: "bg-orange-600 hover:bg-orange-700",
      onClick: () => navigate("/purchases/receives/new"),
    },
    {
      label: "View Items",
      icon: FiBarChart2,
      color: "bg-indigo-600 hover:bg-indigo-700",
      onClick: () => navigate("/items"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.name || "User"}! 👋
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Here's what's happening with your pharmacy today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboard}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm border border-gray-200"
                title="Refresh Dashboard"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                <FiCalendar className="w-4 h-4 inline mr-2" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            icon={<FiBox className="w-6 h-6" />}
            label="Total Medicines"
            value={dashboard?.totalItems || 0}
            trend="+12%"
            trendUp={true}
            color="blue"
            onClick={() => navigate("/items")}
          />
          <SummaryCard
            icon={<FiAlertTriangle className="w-6 h-6" />}
            label="Low Stock Items"
            value={dashboard?.lowStockItems || 0}
            trend="Needs attention"
            trendUp={false}
            color="red"
            urgent={dashboard?.lowStockItems > 0}
          />
          <SummaryCard
            icon={<FiTrendingUp className="w-6 h-6" />}
            label="Today's Sales"
            value={formatCurrency(dashboard?.todaysSales || 0)}
            trend="+8%"
            trendUp={true}
            color="green"
          />
          <SummaryCard
            icon={<FiUsers className="w-6 h-6" />}
            label="Total Vendors"
            value={dashboard?.totalVendors || 0}
            color="purple"
            onClick={() => navigate("/purchases/suppliers")}
          />
          <SummaryCard
            icon={<FiShoppingCart className="w-6 h-6" />}
            label="Pending Orders"
            value={dashboard?.pendingOrders || 0}
            trend="In progress"
            color="orange"
            onClick={() => navigate("/sales/orders")}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiActivity className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105 hover:shadow-lg active:scale-95`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid - Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Analytics Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiBarChart2 className="w-5 h-5 text-blue-600" />
                Sales Analytics
              </h2>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            <SalesChart data={dashboard?.salesChartData || []} />
          </div>

          {/* Notifications Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiBell className="w-5 h-5 text-orange-500" />
                Notifications
              </h2>
              {dashboard?.notifications?.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {dashboard.notifications.length} New
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {dashboard?.notifications?.length > 0 ? (
                dashboard.notifications.map((notification, index) => (
                  <NotificationItem key={index} notification={notification} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiBell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiAlertTriangle className="w-5 h-5 text-red-500" />
                  Low Stock Alerts
                </h2>
                <button
                  onClick={() => navigate("/items")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {dashboard?.lowStockList?.length > 0 ? (
                dashboard.lowStockList.map((item, index) => (
                  <div
                    key={index}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/items`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FiPackage className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">SKU: {item.sku || "N/A"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          {item.stockOnHand} {item.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Reorder: {item.reorderLevel} {item.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <FiCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p className="font-medium">All items are well stocked!</p>
                  <p className="text-sm">No items require restocking at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Expiry Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-yellow-600" />
                  Expiry Alerts
                </h2>
                <span className="text-sm text-gray-500">Next 30 days</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {dashboard?.expiringItems?.length > 0 ? (
                dashboard.expiringItems.map((item, index) => {
                  const daysLeft = getDaysUntilExpiry(item.expiryDate);
                  const isUrgent = daysLeft <= 7;
                  return (
                    <div
                      key={index}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 ${
                              isUrgent ? "bg-red-100" : "bg-yellow-100"
                            } rounded-lg flex items-center justify-center`}
                          >
                            <FiCalendar
                              className={`w-5 h-5 ${
                                isUrgent ? "text-red-600" : "text-yellow-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              Stock: {item.stockOnHand} {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              isUrgent ? "text-red-600" : "text-yellow-600"
                            }`}
                          >
                            {daysLeft} days left
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires: {formatDate(item.expiryDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <FiCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p className="font-medium">No expiring items!</p>
                  <p className="text-sm">All items have valid expiry dates.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-green-600" />
                  Recent Sales
                </h2>
                <button
                  onClick={() => navigate("/sales/invoices")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {dashboard?.recentInvoices?.length > 0 ? (
                dashboard.recentInvoices.map((invoice, index) => (
                  <div
                    key={index}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/sales/invoices/${invoice.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FiFileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(invoice.invoiceDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(invoice.netPayable)}
                        </p>
                        <StatusBadge status={invoice.paymentStatus} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <FiFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No recent sales</p>
                  <p className="text-sm">Create an invoice to get started.</p>
                  <button
                    onClick={() => navigate("/sales/invoices/new")}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    <FiPlus className="w-4 h-4" />
                    Create Invoice
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiTruck className="w-5 h-5 text-purple-600" />
                  Recent Purchases
                </h2>
                <button
                  onClick={() => navigate("/purchases/receives")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {dashboard?.recentPurchases?.length > 0 ? (
                dashboard.recentPurchases.map((purchase, index) => (
                  <div
                    key={index}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate("/purchases/receives")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FiTruck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {purchase.receiveNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {purchase.supplier?.displayName ||
                              purchase.supplier?.name ||
                              "Unknown Vendor"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(purchase.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(purchase.receiveDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <FiTruck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No recent purchases</p>
                  <p className="text-sm">Record a purchase to get started.</p>
                  <button
                    onClick={() => navigate("/purchases/receives/new")}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                  >
                    <FiPlus className="w-4 h-4" />
                    New Purchase
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ icon, label, value, trend, trendUp, color, urgent, onClick }) => {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      light: "bg-blue-100",
      text: "text-blue-600",
    },
    red: {
      bg: "bg-gradient-to-br from-red-500 to-red-600",
      light: "bg-red-100",
      text: "text-red-600",
    },
    green: {
      bg: "bg-gradient-to-br from-green-500 to-green-600",
      light: "bg-green-100",
      text: "text-green-600",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-500 to-purple-600",
      light: "bg-purple-100",
      text: "text-purple-600",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-500 to-orange-600",
      light: "bg-orange-100",
      text: "text-orange-600",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200/50 p-5 transition-all hover:shadow-md ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      } ${urgent ? "ring-2 ring-red-200 animate-pulse" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-white shadow-lg`}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trendUp
                ? "bg-green-100 text-green-600"
                : trendUp === false
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

// Sales Chart Component
const SalesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FiBarChart2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No sales data available</p>
        </div>
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => d.totalSales), 1);

  return (
    <div className="h-64">
      <div className="flex items-end justify-between h-48 gap-2 sm:gap-4">
        {data.map((day, index) => {
          const height = (day.totalSales / maxSales) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-100 rounded-t-lg relative h-40 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500"
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  {day.totalSales > 0 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap hidden sm:block">
                      Rs. {(day.totalSales / 1000).toFixed(1)}k
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500">{day.dayName}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
        <span>
          Total: Rs.{" "}
          {data.reduce((sum, d) => sum + d.totalSales, 0).toLocaleString("en-NP")}
        </span>
        <span>
          {data.reduce((sum, d) => sum + d.orderCount, 0)} orders
        </span>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusClasses = {
    paid: "bg-green-100 text-green-700 border-green-200",
    unpaid: "bg-yellow-100 text-yellow-700 border-yellow-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    overdue: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
        statusClasses[status?.toLowerCase()] || statusClasses.pending
      }`}
    >
      {status || "Pending"}
    </span>
  );
};

// Notification Item Component
const NotificationItem = ({ notification }) => {
  const typeIcons = {
    warning: <FiAlertTriangle className="w-4 h-4 text-yellow-500" />,
    error: <FiXCircle className="w-4 h-4 text-red-500" />,
    success: <FiCheckCircle className="w-4 h-4 text-green-500" />,
    info: <FiBell className="w-4 h-4 text-blue-500" />,
  };

  const typeColors = {
    warning: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
    success: "bg-green-50 border-green-200",
    info: "bg-blue-50 border-blue-200",
  };

  const type = notification.type || "info";

  return (
    <div
      className={`p-3 rounded-xl border ${typeColors[type]} transition-all hover:shadow-sm cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{typeIcons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
