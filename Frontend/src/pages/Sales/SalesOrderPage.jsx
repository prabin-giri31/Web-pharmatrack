import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiFileText,
  FiLoader,
} from "react-icons/fi";
import SalesOrderList from "../../Components/private/Sales/SalesOrderList";
import SalesOrderFilters from "../../Components/private/Sales/SalesOrderFilters";
import CreateSalesOrderModal from "../../Components/private/Sales/CreateSalesOrderModal";
import SalesOrderDetailsModal from "../../Components/private/Sales/SalesOrderDetailsModal";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { statusCardColors } from "../../utils/statusStyles";

// Status configuration - reusable for similar pages
const ORDER_STATUS_CONFIG = [
  { key: "all", label: "All", color: "blue" },
  { key: "draft", label: "Draft", color: "gray" },
  { key: "confirmed", label: "Confirmed", color: "indigo" },
  { key: "delivered", label: "Delivered", color: "green" },
  { key: "invoiced", label: "Invoiced", color: "purple" },
  { key: "cancelled", label: "Cancelled", color: "red" },
];

const PAYMENT_STATUS_CONFIG = [
  { key: "all", label: "All Payments" },
  { key: "unpaid", label: "Unpaid" },
  { key: "partially_paid", label: "Partially Paid" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
];

const SalesOrderPage = () => {
  const navigate = useNavigate();

  // State management
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activePaymentFilter, setActivePaymentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Fetch all data
  const fetchAllData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [ordersResult, customersResult, productsResult] = await Promise.all([
        apiRequest(API_ENDPOINTS.salesOrders),
        apiRequest(API_ENDPOINTS.customers),
        apiRequest(API_ENDPOINTS.items),
      ]);

      if (ordersResult.success) {
        // Normalize the data from backend
        const normalizedOrders = (ordersResult.data || []).map((order) => ({
          ...order,
          customer: order.customer || {},
          items: order.items || [],
          subtotal: Number(order.subtotal) || 0,
          totalDiscount: Number(order.totalDiscount) || 0,
          totalTax: Number(order.totalTax) || 0,
          grandTotal: Number(order.grandTotal) || 0,
          advancePayment: Number(order.advancePayment) || 0,
        }));
        setSalesOrders(normalizedOrders);
      } else {
        setError(ordersResult.error || "Failed to fetch orders");
      }

      if (customersResult.success) {
        setCustomers(customersResult.data || []);
      }

      if (productsResult.success) {
        const normalized = (productsResult.data || []).map((item) => ({
          id: item.id,
          name: item.name || item.itemName,
          sku: item.sku || "",
          unit: item.unit || "",
          unitPrice: Number(item.sellingPrice || item.unitPrice || 0),
          stock: item.stockOnHand ?? 0,
          tax: Number(item.tax || 0),
          description: item.description || "",
        }));
        setProducts(normalized);
      }
    } catch (err) {
      setError("Failed to load data. Please check your connection.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Generate new order number
  const generateOrderNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const nextNum = salesOrders.length + 1;
    return `SO-${year}-${String(nextNum).padStart(4, "0")}`;
  }, [salesOrders.length]);

  // Filter orders - memoized for performance
  const filteredOrders = useMemo(() => {
    let result = [...salesOrders];

    // Status filter
    if (activeStatusFilter !== "all") {
      result = result.filter((order) => order.status === activeStatusFilter);
    }

    // Payment status filter
    if (activePaymentFilter !== "all") {
      result = result.filter((order) => order.paymentStatus === activePaymentFilter);
    }

    // Customer filter
    if (selectedCustomer !== "all") {
      result = result.filter((order) => order.customerId === parseInt(selectedCustomer));
    }

    // Date range filter
    if (dateRange.start) {
      result = result.filter((order) => order.orderDate >= dateRange.start);
    }
    if (dateRange.end) {
      result = result.filter((order) => order.orderDate <= dateRange.end);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(query) ||
          order.customer?.name?.toLowerCase().includes(query) ||
          order.customer?.company?.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [salesOrders, activeStatusFilter, activePaymentFilter, selectedCustomer, dateRange, searchQuery]);

  // Calculate order counts by status
  const orderCounts = useMemo(() => {
    const counts = { all: salesOrders.length };
    ORDER_STATUS_CONFIG.forEach(({ key }) => {
      if (key !== "all") {
        counts[key] = salesOrders.filter((o) => o.status === key).length;
      }
    });
    return counts;
  }, [salesOrders]);

  // CRUD Handlers
  const handleCreateOrder = async (orderData) => {
    try {
      // Prepare data for backend
      const payload = {
        customerId: parseInt(orderData.customerId),
        orderDate: orderData.orderDate,
        expectedDeliveryDate: orderData.expectedDeliveryDate,
        status: orderData.status || "draft",
        paymentStatus: orderData.paymentStatus || "unpaid",
        paymentMethod: orderData.paymentMethod || null,
        dueDate: orderData.dueDate || null,
        advancePayment: parseFloat(orderData.advancePayment) || 0,
        notes: orderData.notes || "",
        items: orderData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
        })),
      };

      const result = await apiRequest(API_ENDPOINTS.salesOrders, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result.success) {
        // Normalize the returned order
        const newOrder = {
          ...result.data,
          customer: result.data.customer || customers.find(c => c.id === payload.customerId) || {},
        };
        setSalesOrders((prev) => [newOrder, ...prev]);
        setIsCreateModalOpen(false);
        return { success: true };
      } else {
        alert(result.error || "Failed to create order");
        return { success: false, error: result.error };
      }
    } catch (err) {
      alert("An error occurred while creating the order");
      return { success: false, error: err.message };
    }
  };

  const handleUpdateOrder = async (orderData) => {
    try {
      const payload = {
        customerId: parseInt(orderData.customerId),
        orderDate: orderData.orderDate,
        expectedDeliveryDate: orderData.expectedDeliveryDate,
        paymentMethod: orderData.paymentMethod || null,
        dueDate: orderData.dueDate || null,
        advancePayment: parseFloat(orderData.advancePayment) || 0,
        notes: orderData.notes || "",
        items: orderData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
        })),
      };

      const result = await apiRequest(`${API_ENDPOINTS.salesOrders}/${orderData.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (result.success) {
        setSalesOrders((prev) =>
          prev.map((order) => (order.id === orderData.id ? {
            ...result.data,
            customer: result.data.customer || order.customer,
          } : order))
        );
        setIsCreateModalOpen(false);
        setEditingOrder(null);
        return { success: true };
      } else {
        alert(result.error || "Failed to update order");
        return { success: false, error: result.error };
      }
    } catch (err) {
      alert("An error occurred while updating the order");
      return { success: false, error: err.message };
    }
  };

  const handleDeleteOrder = async (order) => {
    if (order.status !== "draft") {
      alert("Only draft orders can be deleted.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      return;
    }

    const result = await apiRequest(`${API_ENDPOINTS.salesOrders}/${order.id}`, {
      method: "DELETE",
    });

    if (result.success) {
      setSalesOrders((prev) => prev.filter((o) => o.id !== order.id));
    } else {
      alert(result.error || "Failed to delete order");
    }
  };

  const handleUpdateStatus = async (order, newStatus) => {
    const result = await apiRequest(`${API_ENDPOINTS.salesOrders}/${order.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    if (result.success) {
      setSalesOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
      // Refresh viewing order if open
      if (viewingOrder?.id === order.id) {
        setViewingOrder({ ...viewingOrder, status: newStatus });
      }
      return { success: true };
    } else {
      alert(result.error || `Failed to update order status`);
      return { success: false };
    }
  };

  const handleCancelOrder = async (order) => {
    if (order.status === "cancelled" || order.status === "invoiced") {
      alert("This order cannot be cancelled.");
      return;
    }
    if (!window.confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) {
      return;
    }
    await handleUpdateStatus(order, "cancelled");
  };

  const handleConfirmOrder = async (order) => {
    if (order.status !== "draft") {
      alert("Only draft orders can be confirmed.");
      return;
    }
    await handleUpdateStatus(order, "confirmed");
  };

  const handleMarkDelivered = async (order) => {
    if (order.status !== "confirmed") {
      alert("Only confirmed orders can be marked as delivered.");
      return;
    }
    await handleUpdateStatus(order, "delivered");
  };

  const handleDuplicateOrder = async (order) => {
    const duplicatedData = {
      customerId: order.customerId,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: order.expectedDeliveryDate,
      status: "draft",
      paymentStatus: "unpaid",
      paymentMethod: order.paymentMethod,
      dueDate: "",
      advancePayment: 0,
      notes: order.notes,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        discount: parseFloat(item.discount) || 0,
        tax: parseFloat(item.tax) || 0,
      })),
    };

    const result = await apiRequest(API_ENDPOINTS.salesOrders, {
      method: "POST",
      body: JSON.stringify(duplicatedData),
    });

    if (result.success) {
      const newOrder = {
        ...result.data,
        customer: order.customer,
      };
      setSalesOrders((prev) => [newOrder, ...prev]);
    } else {
      alert(result.error || "Failed to duplicate order");
    }
  };

  const handleEditOrder = (order) => {
    if (order.status !== "draft") {
      alert("Only draft orders can be edited.");
      return;
    }
    // Normalize the order data for editing
    const editData = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productId: item.productId,
        product: products.find((p) => p.id === item.productId) || {
          id: item.productId,
          name: item.productName,
          sku: item.productSku,
          stock: 999, // Assume available if not found
        },
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        discount: parseFloat(item.discount) || 0,
        tax: parseFloat(item.tax) || 0,
      })),
    };
    setEditingOrder(editData);
    setIsCreateModalOpen(true);
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleConvertToInvoice = async (order) => {
    if (order.status !== "delivered") {
      alert("Only delivered orders can be converted to invoice.");
      return;
    }

    const result = await apiRequest(API_ENDPOINTS.invoices, {
      method: "POST",
      body: JSON.stringify({
        salesOrderId: order.id,
        customerId: order.customerId,
        status: "finalized",
        paymentStatus: "unpaid",
      }),
    });

    if (result.success) {
      // Update order status to invoiced
      await handleUpdateStatus(order, "invoiced");
      navigate(`/sales/invoices/${result.data.id}`);
    } else {
      alert(result.error || "Failed to convert to invoice");
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setActiveStatusFilter("all");
    setActivePaymentFilter("all");
    setSelectedCustomer("all");
    setDateRange({ start: "", end: "" });
    fetchAllData(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading sales orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && salesOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => fetchAllData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FiFileText className="w-7 h-7 text-blue-600" />
                Sales Orders
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your sales orders and track deliveries
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <FiRefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                New Sales Order
              </button>
            </div>
          </div>

          {/* Status Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mt-6">
            {ORDER_STATUS_CONFIG.map(({ key, label, color }) => (
              <StatusCard
                key={key}
                label={label}
                count={orderCounts[key] || 0}
                active={activeStatusFilter === key}
                onClick={() => setActiveStatusFilter(key)}
                color={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <SalesOrderFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activePaymentFilter={activePaymentFilter}
        onPaymentFilterChange={setActivePaymentFilter}
        selectedCustomer={selectedCustomer}
        onCustomerChange={setSelectedCustomer}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customers={customers}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        paymentFilters={PAYMENT_STATUS_CONFIG}
      />

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredOrders.length}</span> of{" "}
            <span className="font-semibold">{salesOrders.length}</span> orders
          </p>
        </div>

        <SalesOrderList
          orders={filteredOrders}
          onView={handleViewOrder}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onCancel={handleCancelOrder}
          onConfirm={handleConfirmOrder}
          onDuplicate={handleDuplicateOrder}
          onConvertToInvoice={handleConvertToInvoice}
          onMarkDelivered={handleMarkDelivered}
        />
      </div>

      {/* Create/Edit Modal */}
      <CreateSalesOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={editingOrder ? handleUpdateOrder : handleCreateOrder}
        editingOrder={editingOrder}
        customers={customers}
        products={products}
        generateOrderNumber={generateOrderNumber}
      />

      {/* Details Modal */}
      <SalesOrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingOrder(null);
        }}
        order={viewingOrder}
        onEdit={handleEditOrder}
        onConfirm={handleConfirmOrder}
        onCancel={handleCancelOrder}
        onConvertToInvoice={handleConvertToInvoice}
        onDuplicate={handleDuplicateOrder}
        onMarkDelivered={handleMarkDelivered}
      />
    </div>
  );
};

// Reusable Status Card Component
const StatusCard = ({ label, count, active, onClick, color }) => {
  const colorConfig = statusCardColors[color] || statusCardColors.blue;
  const state = active ? colorConfig.active : colorConfig.inactive;

  return (
    <button
      onClick={onClick}
      className={`${state.bg} ${state.text} rounded-xl p-3 text-left transition-all duration-200 hover:shadow-md`}
    >
      <p className="text-xs font-medium">{label}</p>
      <p className="text-xl font-bold mt-1">{count}</p>
    </button>
  );
};

export default SalesOrderPage;
