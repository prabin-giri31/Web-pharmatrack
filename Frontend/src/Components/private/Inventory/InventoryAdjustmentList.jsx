import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiMoreHorizontal,
  FiRefreshCw,
  FiAlertTriangle,
  FiAlertCircle,
  FiFileText,
  FiFilter,
  FiCalendar,
  FiPackage,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";
import NewAdjustmentModal from "./NewAdjustmentModal";

const InventoryAdjustments = () => {
  const navigate = useNavigate();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "All",
    period: "All",
  });

  // Fetch adjustments from API
  const fetchAdjustments = async () => {
    setLoading(true);
    setError(null);
    setIsNetworkError(false);

    const params = new URLSearchParams();
    if (filters.type !== "All") params.append("type", filters.type);
    if (filters.period !== "All") params.append("period", filters.period);

    const result = await apiRequest(
      `${API_ENDPOINTS.inventory}/adjustments?${params.toString()}`
    );

    if (result.success) {
      setAdjustments(result.data);
    } else {
      setError(result.error);
      setIsNetworkError(result.isNetworkError);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAdjustments();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Format date as MM/DD/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Format time as hh:mm AM/PM
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Status badge styles
  const getStatusBadge = (status) => {
    const styles = {
      Completed: "bg-green-100 text-green-700 border border-green-200",
      Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      Failed: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  // Type badge styles
  const getTypeBadge = (type) => {
    return type === "Increase"
      ? "bg-blue-100 text-blue-700 border border-blue-200"
      : "bg-orange-100 text-orange-700 border border-orange-200";
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="text-blue-600 text-xl" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Inventory Adjustments
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Manage stock increases and decreases
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button className="hidden lg:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition">
              <FiFileText className="text-lg" />
              FIFO Report
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
            >
              <FiPlus className="text-lg" />
              <span>New</span>
            </button>
            <button className="p-2.5 rounded-lg hover:bg-gray-100 transition border border-gray-200">
              <FiMoreHorizontal className="text-gray-600 text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 flex-1 sm:flex-none">
            <div className="flex items-center gap-2 text-gray-600">
              <FiFilter className="text-lg" />
              <span className="text-sm font-medium">Type:</span>
            </div>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="flex-1 sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
            </select>
          </div>
          <div className="flex items-center gap-3 flex-1 sm:flex-none">
            <div className="flex items-center gap-2 text-gray-600">
              <FiCalendar className="text-lg" />
              <span className="text-sm font-medium">Period:</span>
            </div>
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="flex-1 sm:w-44 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-500 text-sm">Loading adjustments...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div
              className={`p-4 rounded-full mb-4 ${
                isNetworkError ? "bg-yellow-100" : "bg-red-100"
              }`}
            >
              {isNetworkError ? (
                <FiAlertTriangle className="text-yellow-600 text-3xl" />
              ) : (
                <FiAlertCircle className="text-red-600 text-3xl" />
              )}
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${
                isNetworkError ? "text-yellow-700" : "text-red-700"
              }`}
            >
              {isNetworkError ? "Connection Error" : "Something went wrong"}
            </h3>
            <p className="text-gray-500 text-sm text-center max-w-md mb-4">
              {error}
            </p>
            <button
              onClick={fetchAdjustments}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition ${
                isNetworkError
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              <FiRefreshCw className="text-lg" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && adjustments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <FiPackage className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Adjustments Found
            </h3>
            <p className="text-gray-500 text-sm text-center max-w-md mb-4">
              There are no inventory adjustments matching your filters.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <FiPlus className="text-lg" />
              Create First Adjustment
            </button>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && adjustments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    "DATE",
                    "ITEM",
                    "REASON",
                    "DESCRIPTION",
                    "STATUS",
                    "REFERENCE",
                    "TYPE",
                    "QTY",
                    "CREATED BY",
                    "CREATED TIME",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    className="hover:bg-blue-50/50 transition cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(adj.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiPackage className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {adj.itemName || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {adj.reason || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                      {adj.description || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          adj.status
                        )}`}
                      >
                        {adj.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {adj.reference || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                          adj.type
                        )}`}
                      >
                        {adj.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium whitespace-nowrap">
                      {adj.quantity || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {adj.createdBy || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatTime(adj.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!loading && !error && adjustments.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{adjustments.length}</span>{" "}
              adjustment{adjustments.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* New Adjustment Modal */}
      <NewAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchAdjustments();
        }}
      />
    </div>
  );
};

export default InventoryAdjustments;
