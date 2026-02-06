import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiActivity,
  FiSearch,
  FiFilter,
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiGlobe,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiFlag,
  FiRefreshCw,
  FiCalendar,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { formatDateTime } from "../../utils/formatters";

const ActivityLogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [actionFilter, setActionFilter] = useState(searchParams.get("action") || "");
  const [suspiciousFilter, setSuspiciousFilter] = useState(searchParams.get("suspicious") || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [activeTab, setActiveTab] = useState("all"); // all, login, suspicious

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", pagination.page);
      params.set("limit", pagination.limit);
      if (actionFilter) params.set("action", actionFilter);
      if (suspiciousFilter) params.set("isSuspicious", suspiciousFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      
      let endpoint = API_ENDPOINTS.superAdmin.activities;
      if (activeTab === "login") {
        endpoint = API_ENDPOINTS.superAdmin.loginHistory;
      } else if (activeTab === "suspicious") {
        endpoint = API_ENDPOINTS.superAdmin.suspiciousActivities;
      }
      
      const result = await apiRequest(`${endpoint}?${params.toString()}`);
      if (result.success) {
        setActivities(result.data.activities || result.data.logins || []);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || "Failed to fetch activities");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter, suspiciousFilter, startDate, endDate, activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await apiRequest(API_ENDPOINTS.superAdmin.activityStats);
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [fetchActivities, fetchStats]);

  const handleMarkSuspicious = async (activityId, isSuspicious) => {
    try {
      const result = await apiRequest(
        `${API_ENDPOINTS.superAdmin.activities}/${activityId}/mark-suspicious`,
        {
          method: "POST",
          body: JSON.stringify({ isSuspicious }),
        }
      );
      if (result.success) {
        fetchActivities();
        fetchStats();
      }
    } catch (err) {
      alert("Failed to update activity");
    }
  };

  const getActionColor = (action) => {
    const colors = {
      LOGIN: "bg-green-100 text-green-700",
      LOGOUT: "bg-gray-100 text-gray-700",
      LOGIN_FAILED: "bg-red-100 text-red-700",
      ACCOUNT_LOCKED: "bg-red-100 text-red-700",
      USER_APPROVED: "bg-blue-100 text-blue-700",
      USER_REJECTED: "bg-orange-100 text-orange-700",
      USER_ACTIVATED: "bg-green-100 text-green-700",
      USER_DEACTIVATED: "bg-yellow-100 text-yellow-700",
      USER_LOCKED: "bg-red-100 text-red-700",
      USER_UNLOCKED: "bg-green-100 text-green-700",
      PASSWORD_RESET: "bg-purple-100 text-purple-700",
      FORCE_LOGOUT: "bg-orange-100 text-orange-700",
      SETTING_UPDATED: "bg-blue-100 text-blue-700",
    };
    return colors[action] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiActivity className="w-6 h-6" />
                Activity Logs
              </h1>
              <p className="text-sm text-gray-500 mt-1">Monitor user activities and login history</p>
            </div>
            <button
              onClick={() => {
                fetchActivities();
                fetchStats();
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Today's Activities</p>
              <p className="text-2xl font-bold text-blue-600">{stats.todayActivities}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Suspicious</p>
              <p className="text-2xl font-bold text-red-600">{stats.suspiciousCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Top Action</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.activityByAction?.[0]?.action || "-"}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {["all", "login", "suspicious"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "all" && "All Activities"}
              {tab === "login" && "Login History"}
              {tab === "suspicious" && (
                <span className="flex items-center gap-1">
                  <FiAlertTriangle className="w-4 h-4" />
                  Suspicious
                  {stats?.suspiciousCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                      {stats.suspiciousCount}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            {activeTab === "all" && (
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGIN_FAILED">Login Failed</option>
                <option value="LOGOUT">Logout</option>
                <option value="USER_APPROVED">User Approved</option>
                <option value="USER_LOCKED">User Locked</option>
                <option value="PASSWORD_RESET">Password Reset</option>
                <option value="SETTING_UPDATED">Setting Updated</option>
              </select>
            )}
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                setActionFilter("");
                setStartDate("");
                setEndDate("");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FiAlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 hover:bg-gray-50 ${
                        activity.isSuspicious ? "bg-red-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(
                                activity.action
                              )}`}
                            >
                              {activity.action}
                            </span>
                            {activity.isSuspicious && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                <FiAlertTriangle className="w-3 h-3" /> Suspicious
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 mb-1">{activity.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            {activity.user && (
                              <span className="flex items-center gap-1">
                                <FiUser className="w-3 h-3" />
                                {activity.user.name} ({activity.user.email})
                              </span>
                            )}
                            {activity.ipAddress && (
                              <span className="flex items-center gap-1">
                                <FiGlobe className="w-3 h-3" />
                                {activity.ipAddress}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {formatDateTime(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarkSuspicious(activity.id, !activity.isSuspicious)}
                          className={`p-2 rounded-lg transition-colors ${
                            activity.isSuspicious
                              ? "text-red-600 hover:bg-red-100"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                          title={activity.isSuspicious ? "Remove suspicious flag" : "Mark as suspicious"}
                        >
                          <FiFlag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center text-gray-500">
                    No activities found
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} activities
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
