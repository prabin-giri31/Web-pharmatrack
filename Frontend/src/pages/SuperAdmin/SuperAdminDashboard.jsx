import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiAlertTriangle,
  FiUserCheck,
  FiUserX,
  FiLock,
  FiActivity,
  FiClock,
  FiLoader,
  FiSettings,
  FiShield,
  FiDatabase,
  FiBarChart2,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiRequest(API_ENDPOINTS.superAdmin.dashboard);
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  const statCards = [
    { label: "Total Users", value: stats.totalUsers || 0, icon: FiUsers, color: "blue", link: "/super-admin/users" },
    { label: "Pending Approval", value: stats.pendingUsers || 0, icon: FiUserCheck, color: "yellow", link: "/super-admin/users?status=pending" },
    { label: "Active Users", value: stats.activeUsers || 0, icon: FiUserCheck, color: "green" },
    { label: "Locked Users", value: stats.lockedUsers || 0, icon: FiLock, color: "red", link: "/super-admin/users?status=locked" },
    { label: "Total Medicines", value: stats.totalItems || 0, icon: FiPackage, color: "purple" },
    { label: "Total Sales", value: formatCurrency(stats.totalSales || 0), icon: FiDollarSign, color: "emerald" },
    { label: "Total Customers", value: stats.totalCustomers || 0, icon: FiUsers, color: "indigo" },
    { label: "Total Suppliers", value: stats.totalSuppliers || 0, icon: FiTruck, color: "orange" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
      green: "bg-green-50 text-green-600 border-green-200",
      red: "bg-red-50 text-red-600 border-red-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-2">
            <FiShield className="w-8 h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">Super Admin Dashboard</h1>
          </div>
          <p className="text-purple-200">Complete system overview and control</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/super-admin/users")}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900">Manage Users</span>
          </button>
          <button
            onClick={() => navigate("/super-admin/activities")}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <FiActivity className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium text-gray-900">Activity Logs</span>
          </button>
          <button
            onClick={() => navigate("/super-admin/settings")}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiSettings className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium text-gray-900">System Settings</span>
          </button>
          <button
            onClick={() => navigate("/super-admin/data")}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
          >
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiDatabase className="w-5 h-5 text-orange-600" />
            </div>
            <span className="font-medium text-gray-900">Data Management</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <button
              key={index}
              onClick={() => stat.link && navigate(stat.link)}
              className={`p-4 rounded-xl border ${getColorClasses(stat.color)} hover:shadow-md transition-all ${stat.link ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5" />
                {stat.label === "Pending Approval" && stats.pendingUsers > 0 && (
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-75">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Suspicious Activities Alert */}
        {stats.suspiciousActivities > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Suspicious Activities Detected</p>
                <p className="text-sm text-red-600">{stats.suspiciousActivities} suspicious activities require attention</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/super-admin/activities?suspicious=true")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Review
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiActivity className="w-4 h-4" />
                Recent Activities
              </h2>
              <button
                onClick={() => navigate("/super-admin/activities")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {dashboardData?.recentActivities?.length > 0 ? (
                dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${activity.isSuspicious ? "text-red-600" : "text-gray-900"}`}>
                          {activity.action}
                          {activity.isSuspicious && (
                            <FiAlertTriangle className="inline-block w-3 h-3 ml-1" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.user?.name || "Unknown"} • {activity.user?.pharmacy}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {formatDateTime(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  No recent activities
                </div>
              )}
            </div>
          </div>

          {/* Recent Logins */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiUsers className="w-4 h-4" />
                Recent Logins
              </h2>
              <button
                onClick={() => navigate("/super-admin/activities?type=login")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {dashboardData?.recentLogins?.length > 0 ? (
                dashboardData.recentLogins.map((login) => (
                  <div key={login.id} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{login.name}</p>
                        <p className="text-xs text-gray-500">{login.pharmacy}</p>
                        <p className="text-xs text-gray-400">{login.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{formatDateTime(login.lastLoginAt)}</p>
                        <p className="text-xs text-gray-400">{login.lastLoginIp}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  No recent logins
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Users by Sales */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4" />
              Top Users by Sales
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacy</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData?.topUsersBySales?.length > 0 ? (
                  dashboardData.topUsersBySales.map((user, index) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.pharmacy}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{user.invoiceCount}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(user.totalSales)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
