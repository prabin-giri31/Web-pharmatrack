import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRupeeSign } from 'react-icons/fa';
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import {
  FiPlus,
  FiSearch,
  FiShoppingCart,
  FiCalendar,
  FiFilter,
  FiChevronRight,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiSend,
  FiPackage,
  FiMoreVertical,
  FiEye,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";

const PurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, sentCount: 0, draftCount: 0, totalValue: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    const result = await apiRequest(`${API_ENDPOINTS.purchaseOrders}${statusFilter ? `?status=${statusFilter}` : ""}`);
    if (result.success) {
      const ordersData = result.data?.purchaseOrders || [];
      setOrders(ordersData);
      
      // Calculate stats from orders
      const totalOrders = ordersData.length;
      const sentCount = ordersData.filter(o => ['sent', 'confirmed'].includes(o.status)).length;
      const draftCount = ordersData.filter(o => o.status === 'draft').length;
      const totalValue = ordersData.reduce((sum, o) => sum + parseFloat(o.grandTotal || 0), 0);
      setStats({ totalOrders, sentCount, draftCount, totalValue });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (!window.confirm("Are you sure you want to delete this purchase order?")) return;
    
    const result = await apiRequest(`${API_ENDPOINTS.purchaseOrders}/${id}`, { method: "DELETE" });
    if (result.success) {
      setMessage("Purchase order deleted successfully");
      fetchOrders();
    } else {
      setMessage(result.error || "Failed to delete order");
    }
  };

  const handleStatusChange = async (id, status, e) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    
    const result = await apiRequest(`${API_ENDPOINTS.purchaseOrders}/${id}/status`, { 
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    if (result.success) {
      setMessage(`Order status updated to ${status}`);
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.supplier?.displayName?.toLowerCase().includes(searchLower) ||
      order.supplier?.companyName?.toLowerCase().includes(searchLower) ||
      order.referenceNumber?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case "confirmed":
        return { icon: FiCheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Confirmed" };
      case "sent":
        return { icon: FiSend, color: "text-blue-600", bg: "bg-blue-100", label: "Sent" };
      case "draft":
        return { icon: FiClock, color: "text-amber-600", bg: "bg-amber-100", label: "Draft" };
      case "partially_received":
        return { icon: FiPackage, color: "text-purple-600", bg: "bg-purple-100", label: "Partial" };
      case "received":
        return { icon: FiCheckCircle, color: "text-teal-600", bg: "bg-teal-100", label: "Received" };
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
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-200">
                <FiShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Purchase Orders</h1>
                <p className="text-sm text-gray-500 mt-1">Create and manage orders to suppliers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/purchases/orders/new")}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all duration-200 font-medium"
            >
              <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>New Order</span>
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
                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <FiShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Sent/Confirmed</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.sentCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiSend className="w-6 h-6 text-blue-600" />
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
              placeholder="Search by order number, supplier, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-w-[160px] cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="partially_received">Partial</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FiShoppingCart className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No purchase orders found</p>
              <p className="text-sm mt-1">Create your first order to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/purchases/orders/${order.id}`)}
                    className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{order.orderNumber}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="font-medium text-gray-700">{order.supplier?.displayName || order.supplier?.companyName || "Unknown Supplier"}</span>
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {formatDate(order.orderDate)}
                          </span>
                          {order.expectedDeliveryDate && (
                            <span className="text-orange-600">
                              Expected: {formatDate(order.expectedDeliveryDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items Count */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiPackage className="w-4 h-4" />
                        <span>{order.items?.length || 0} items</span>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(order.grandTotal)}</p>
                      </div>

                      {/* Actions */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === order.id ? null : order.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiMoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        {openDropdownId === order.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                navigate(`/purchases/orders/${order.id}`);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <FiEye className="w-4 h-4" />
                              View Details
                            </button>
                            {order.status === 'draft' && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => handleStatusChange(order.id, 'sent', e)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                >
                                  <FiSend className="w-4 h-4" />
                                  Send to Supplier
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(order.id, e)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </>
                            )}
                            {order.status === 'sent' && (
                              <button
                                type="button"
                                onClick={(e) => handleStatusChange(order.id, 'confirmed', e)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                                Mark Confirmed
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <FiChevronRight className="hidden sm:block w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {openDropdownId && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setOpenDropdownId(null)}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
