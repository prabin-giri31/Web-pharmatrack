import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRupeeSign } from 'react-icons/fa';
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import {
  FiPlus,
  FiSearch,
  FiPackage,
  FiTruck,
  FiCalendar,
  FiFilter,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
  FiDownload,
  FiMoreVertical,
  FiEye,
  FiTrash2,
} from "react-icons/fi";

const PurchaseReceivesPage = () => {
  const [receives, setReceives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalReceives: 0, receivedCount: 0, draftCount: 0, totalValue: "0.00" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchReceives = async () => {
    setLoading(true);
    const result = await apiRequest(`${API_ENDPOINTS.purchaseReceives}${statusFilter ? `?status=${statusFilter}` : ""}`);
    if (result.success) {
      setReceives(result.data?.purchaseReceives || []);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const result = await apiRequest(`${API_ENDPOINTS.purchaseReceives}/stats`);
    if (result.success) {
      setStats(result.data);
    }
  };

  useEffect(() => {
    fetchReceives();
    fetchStats();
  }, [statusFilter]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this purchase receive?")) return;
    
    const result = await apiRequest(`${API_ENDPOINTS.purchaseReceives}/${id}`, { method: "DELETE" });
    if (result.success) {
      setMessage("Purchase receive deleted successfully");
      fetchReceives();
      fetchStats();
    }
  };

  const filteredReceives = receives.filter((receive) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      receive.receiveNumber?.toLowerCase().includes(searchLower) ||
      receive.supplier?.displayName?.toLowerCase().includes(searchLower) ||
      receive.supplier?.companyName?.toLowerCase().includes(searchLower) ||
      receive.referenceNumber?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case "received":
        return { icon: FiCheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Received" };
      case "draft":
        return { icon: FiClock, color: "text-amber-600", bg: "bg-amber-100", label: "Draft" };
      case "partially_received":
        return { icon: FiRefreshCw, color: "text-blue-600", bg: "bg-blue-100", label: "Partial" };
      case "cancelled":
        return { icon: FiXCircle, color: "text-red-600", bg: "bg-red-100", label: "Cancelled" };
      default:
        return { icon: FiClock, color: "text-gray-600", bg: "bg-gray-100", label: status };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                <FiTruck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Purchase Receives</h1>
                <p className="text-sm text-gray-500 mt-1">Track and manage your inventory receipts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/purchases/receives/new")}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-200 font-medium"
            >
              <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>New Receive</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Message */}
        {message && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
            <FiCheckCircle className="w-5 h-5" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Receives</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalReceives}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <FiPackage className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.receivedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Drafts</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.draftCount}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <FiClock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaRupeeSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receive number, supplier, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none cursor-pointer min-w-[160px] shadow-sm"
            >
              <option value="">All Status</option>
              <option value="received">Received</option>
              <option value="draft">Draft</option>
              <option value="partially_received">Partial</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Receives List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4 animate-pulse">
              <FiTruck className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-gray-600 font-medium">Loading purchase receives...</p>
          </div>
        ) : filteredReceives.length ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header - Desktop */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Receive #</div>
              <div className="col-span-3">Supplier</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Items</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredReceives.map((receive) => {
                const statusConfig = getStatusConfig(receive.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={receive.id}
                    className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/purchases/receives/${receive.id}`)}
                  >
                    {/* Mobile View */}
                    <div className="lg:hidden space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {receive.receiveNumber?.slice(-4) || "PR"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{receive.receiveNumber}</p>
                            <p className="text-sm text-gray-500">{receive.supplier?.displayName || receive.supplier?.companyName || "Unknown"}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {formatDate(receive.receiveDate)}
                          </span>
                          <span>{receive.items?.length || 0} items</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatCurrency(receive.grandTotal)}</span>
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {receive.receiveNumber?.slice(-4) || "PR"}
                          </div>
                          <span className="font-semibold text-gray-900">{receive.receiveNumber}</span>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <p className="font-medium text-gray-900 truncate">{receive.supplier?.displayName || receive.supplier?.companyName || "Unknown"}</p>
                        <p className="text-sm text-gray-500 truncate">{receive.referenceNumber || "No reference"}</p>
                      </div>
                      <div className="col-span-2 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="w-4 h-4 text-gray-400" />
                          {formatDate(receive.receiveDate)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                          <FiPackage className="w-4 h-4" />
                          {receive.items?.length || 0} items
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="col-span-1 text-right">
                        <span className="font-semibold text-gray-900">{formatCurrency(receive.grandTotal)}</span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/purchases/receives/${receive.id}`); }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(receive.id, e)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FiTruck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter ? "No receives found" : "No purchase receives yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchTerm || statusFilter
                ? "Try adjusting your search or filter criteria."
                : "Start by creating your first purchase receive to track inventory receipts."}
            </p>
            {!searchTerm && !statusFilter && (
              <button
                type="button"
                onClick={() => navigate("/purchases/receives/new")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-200 transition-all font-medium"
              >
                <FiPlus className="w-5 h-5" />
                <span>Create First Receive</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseReceivesPage;
