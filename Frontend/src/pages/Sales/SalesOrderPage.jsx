import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiFileText,
  FiCalendar,
  FiChevronDown,
  FiLoader,
} from "react-icons/fi";
import SalesOrderList from "../../Components/private/Sales/SalesOrderList";
import SalesOrderFilters from "../../Components/private/Sales/SalesOrderFilters";
import CreateSalesOrderModal from "../../Components/private/Sales/CreateSalesOrderModal";
import SalesOrderDetailsModal from "../../Components/private/Sales/SalesOrderDetailsModal";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

// Dummy Products/Items Data
export const dummyProducts = [
  { id: 1, name: "Paracetamol 500mg", sku: "MED001", unit: "Box", unitPrice: 12.50, stock: 500, tax: 5 },
  { id: 2, name: "Ibuprofen 400mg", sku: "MED002", unit: "Box", unitPrice: 15.00, stock: 350, tax: 5 },
  { id: 3, name: "Amoxicillin 250mg", sku: "MED003", unit: "Strip", unitPrice: 8.75, stock: 200, tax: 5 },
  { id: 4, name: "Vitamin C 1000mg", sku: "SUP001", unit: "Bottle", unitPrice: 22.00, stock: 150, tax: 8 },
  { id: 5, name: "Omega-3 Fish Oil", sku: "SUP002", unit: "Bottle", unitPrice: 35.00, stock: 80, tax: 8 },
  { id: 6, name: "Blood Pressure Monitor", sku: "EQP001", unit: "Piece", unitPrice: 89.99, stock: 25, tax: 12 },
  { id: 7, name: "Digital Thermometer", sku: "EQP002", unit: "Piece", unitPrice: 15.99, stock: 100, tax: 12 },
  { id: 8, name: "First Aid Kit", sku: "EQP003", unit: "Kit", unitPrice: 45.00, stock: 40, tax: 12 },
  { id: 9, name: "Bandages (Pack of 50)", sku: "SUP003", unit: "Pack", unitPrice: 8.00, stock: 300, tax: 5 },
  { id: 10, name: "Hand Sanitizer 500ml", sku: "HYG001", unit: "Bottle", unitPrice: 6.50, stock: 450, tax: 8 },
];

// Dummy Customers Data
export const dummyCustomers = [
  { id: 1, name: "John Smith", company: "Tech Solutions Inc.", email: "john@techsolutions.com", phone: "+1 555-0101" },
  { id: 2, name: "Sarah Johnson", company: "HealthCare Plus", email: "sarah@healthcareplus.com", phone: "+1 555-0102" },
  { id: 3, name: "Michael Brown", company: "Brown Enterprises", email: "michael@brownent.com", phone: "+1 555-0103" },
  { id: 4, name: "Emily Davis", company: "MediSupply Co.", email: "emily@medisupply.com", phone: "+1 555-0104" },
  { id: 5, name: "Robert Wilson", company: "Wilson Pharmacy", email: "robert@wilsonpharm.com", phone: "+1 555-0105" },
];

// Dummy Sales Orders Data
const initialSalesOrders = [
  {
    id: 1,
    orderNumber: "SO-2026-0001",
    customerId: 1,
    customer: dummyCustomers[0],
    orderDate: "2026-01-10",
    expectedDeliveryDate: "2026-01-15",
    status: "confirmed",
    paymentStatus: "unpaid",
    paymentMethod: "bank",
    dueDate: "2026-01-25",
    advancePayment: 0,
    items: [
      { productId: 1, product: dummyProducts[0], quantity: 50, unitPrice: 12.50, discount: 5, tax: 5 },
      { productId: 4, product: dummyProducts[3], quantity: 20, unitPrice: 22.00, discount: 0, tax: 8 },
    ],
    subtotal: 1065.00,
    totalDiscount: 31.25,
    totalTax: 66.55,
    grandTotal: 1100.30,
    notes: "Urgent delivery required",
    createdAt: "2026-01-10T09:30:00",
  },
  {
    id: 2,
    orderNumber: "SO-2026-0002",
    customerId: 2,
    customer: dummyCustomers[1],
    orderDate: "2026-01-09",
    expectedDeliveryDate: "2026-01-14",
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "online",
    dueDate: "2026-01-19",
    advancePayment: 500,
    items: [
      { productId: 6, product: dummyProducts[5], quantity: 5, unitPrice: 89.99, discount: 10, tax: 12 },
      { productId: 7, product: dummyProducts[6], quantity: 10, unitPrice: 15.99, discount: 0, tax: 12 },
    ],
    subtotal: 609.85,
    totalDiscount: 45.00,
    totalTax: 67.78,
    grandTotal: 632.63,
    notes: "",
    createdAt: "2026-01-09T14:15:00",
  },
  {
    id: 3,
    orderNumber: "SO-2026-0003",
    customerId: 3,
    customer: dummyCustomers[2],
    orderDate: "2026-01-08",
    expectedDeliveryDate: "2026-01-12",
    status: "invoiced",
    paymentStatus: "partially_paid",
    paymentMethod: "cash",
    dueDate: "2026-01-18",
    advancePayment: 200,
    items: [
      { productId: 2, product: dummyProducts[1], quantity: 30, unitPrice: 15.00, discount: 0, tax: 5 },
      { productId: 3, product: dummyProducts[2], quantity: 40, unitPrice: 8.75, discount: 5, tax: 5 },
    ],
    subtotal: 800.00,
    totalDiscount: 17.50,
    totalTax: 39.13,
    grandTotal: 821.63,
    notes: "Monthly order",
    createdAt: "2026-01-08T10:00:00",
  },
  {
    id: 4,
    orderNumber: "SO-2026-0004",
    customerId: 4,
    customer: dummyCustomers[3],
    orderDate: "2026-01-07",
    expectedDeliveryDate: "2026-01-10",
    status: "draft",
    paymentStatus: "unpaid",
    paymentMethod: "",
    dueDate: "",
    advancePayment: 0,
    items: [
      { productId: 8, product: dummyProducts[7], quantity: 15, unitPrice: 45.00, discount: 10, tax: 12 },
    ],
    subtotal: 675.00,
    totalDiscount: 67.50,
    totalTax: 72.90,
    grandTotal: 680.40,
    notes: "Waiting for confirmation",
    createdAt: "2026-01-07T16:45:00",
  },
  {
    id: 5,
    orderNumber: "SO-2026-0005",
    customerId: 5,
    customer: dummyCustomers[4],
    orderDate: "2026-01-05",
    expectedDeliveryDate: "2026-01-08",
    status: "cancelled",
    paymentStatus: "unpaid",
    paymentMethod: "",
    dueDate: "",
    advancePayment: 0,
    items: [
      { productId: 10, product: dummyProducts[9], quantity: 100, unitPrice: 6.50, discount: 15, tax: 8 },
    ],
    subtotal: 650.00,
    totalDiscount: 97.50,
    totalTax: 44.20,
    grandTotal: 596.70,
    notes: "Customer cancelled",
    createdAt: "2026-01-05T11:20:00",
  },
  {
    id: 6,
    orderNumber: "SO-2026-0006",
    customerId: 1,
    customer: dummyCustomers[0],
    orderDate: "2026-01-04",
    expectedDeliveryDate: "2026-01-09",
    status: "delivered",
    paymentStatus: "overdue",
    paymentMethod: "bank",
    dueDate: "2026-01-11",
    advancePayment: 0,
    items: [
      { productId: 5, product: dummyProducts[4], quantity: 25, unitPrice: 35.00, discount: 5, tax: 8 },
      { productId: 9, product: dummyProducts[8], quantity: 50, unitPrice: 8.00, discount: 0, tax: 5 },
    ],
    subtotal: 1275.00,
    totalDiscount: 43.75,
    totalTax: 86.50,
    grandTotal: 1317.75,
    notes: "Payment overdue",
    createdAt: "2026-01-04T08:30:00",
  },
];

const SalesOrderPage = () => {
  const navigate = useNavigate();
  // State management
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activePaymentFilter, setActivePaymentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch sales orders, customers, and products in parallel
      const [ordersResult, customersResult, productsResult] = await Promise.all([
        apiRequest(API_ENDPOINTS.salesOrders),
        apiRequest(API_ENDPOINTS.customers),
        apiRequest(API_ENDPOINTS.items),
      ]);

      if (ordersResult.success) {
        setSalesOrders(ordersResult.data || []);
      } else {
        setError(ordersResult.error);
      }

      if (customersResult.success) {
        setCustomers(customersResult.data || []);
      }

      if (productsResult.success) {
        const normalized = (productsResult.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku || "",
          unit: item.unit || "",
          unitPrice: Number(item.sellingPrice || 0),
          stock: item.stockOnHand ?? 0,
          tax: Number(item.tax || 0),
          description: item.description || "",
        }));
        setProducts(normalized);
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Generate new order number
  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const nextNum = salesOrders.length + 1;
    return `SO-${year}-${String(nextNum).padStart(4, "0")}`;
  };

  // Filter sales orders
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
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer?.name.toLowerCase().includes(query) ||
          order.customer?.company?.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [salesOrders, activeStatusFilter, activePaymentFilter, selectedCustomer, dateRange, searchQuery]);

  // Order counts
  const orderCounts = useMemo(() => ({
    all: salesOrders.length,
    draft: salesOrders.filter((o) => o.status === "draft").length,
    confirmed: salesOrders.filter((o) => o.status === "confirmed").length,
    delivered: salesOrders.filter((o) => o.status === "delivered").length,
    invoiced: salesOrders.filter((o) => o.status === "invoiced").length,
    cancelled: salesOrders.filter((o) => o.status === "cancelled").length,
  }), [salesOrders]);

  // Handlers
  const handleCreateOrder = async (orderData) => {
    const result = await apiRequest(API_ENDPOINTS.salesOrders, {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    if (result.success) {
      setSalesOrders((prev) => [result.data, ...prev]);
    } else {
      alert(result.error || "Failed to create order");
    }
  };

  const handleUpdateOrder = async (orderData) => {
    const result = await apiRequest(`${API_ENDPOINTS.salesOrders}/${orderData.id}`, {
      method: "PATCH",
      body: JSON.stringify(orderData),
    });

    if (result.success) {
      setSalesOrders((prev) =>
        prev.map((order) => (order.id === orderData.id ? result.data : order))
      );
    } else {
      alert(result.error || "Failed to update order");
    }
  };

  const handleDeleteOrder = async (order) => {
    if (order.status !== "draft") {
      alert("Only draft orders can be deleted.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      const result = await apiRequest(`${API_ENDPOINTS.salesOrders}/${order.id}`, {
        method: "DELETE",
      });

      if (result.success) {
        setSalesOrders((prev) => prev.filter((o) => o.id !== order.id));
      } else {
        alert(result.error || "Failed to delete order");
      }
    }
  };

  const handleCancelOrder = async (order) => {
    if (order.status === "cancelled" || order.status === "invoiced") {
      alert("This order cannot be cancelled.");
      return;
    }
    if (window.confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) {
      const result = await apiRequest(`${API_ENDPOINTS.salesOrders}/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (result.success) {
        setSalesOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o))
        );
      } else {
        alert(result.error || "Failed to cancel order");
      }
    }
  };

  const handleConfirmOrder = async (order) => {
    if (order.status !== "draft") {
      alert("Only draft orders can be confirmed.");
      return;
    }

    const result = await apiRequest(`${API_ENDPOINTS.salesOrders}/${order.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "confirmed" }),
    });

    if (result.success) {
      setSalesOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "confirmed" } : o))
      );
    } else {
      alert(result.error || "Failed to confirm order");
    }
  };

  const handleDuplicateOrder = async (order) => {
    const duplicatedOrder = {
      ...order,
      orderNumber: undefined, // Let backend generate
      status: "draft",
      paymentStatus: "unpaid",
      orderDate: new Date().toISOString().split("T")[0],
    };

    const result = await apiRequest(API_ENDPOINTS.salesOrders, {
      method: "POST",
      body: JSON.stringify(duplicatedOrder),
    });

    if (result.success) {
      setSalesOrders((prev) => [result.data, ...prev]);
    } else {
      alert(result.error || "Failed to duplicate order");
    }
  };

  const handleEditOrder = (order) => {
    if (order.status !== "draft") {
      alert("Only draft orders can be edited.");
      return;
    }
    setEditingOrder(order);
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

    const result = await apiRequest(`${API_ENDPOINTS.salesOrders}/${order.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "invoiced" }),
    });

    if (result.success) {
      setSalesOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "invoiced" } : o))
      );
      alert(`Order ${order.orderNumber} has been converted to invoice.`);
    } else {
      alert(result.error || "Failed to convert to invoice");
    }
  };

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
                onClick={() => {
                  setSalesOrders(initialSalesOrders);
                  setSearchQuery("");
                  setActiveStatusFilter("all");
                  setActivePaymentFilter("all");
                }}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => navigate("/sales/orders/new")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                New Sales Order
              </button>
            </div>
          </div>

          {/* Status Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mt-6">
            <StatusCard label="All" count={orderCounts.all} active={activeStatusFilter === "all"} onClick={() => setActiveStatusFilter("all")} color="blue" />
            <StatusCard label="Draft" count={orderCounts.draft} active={activeStatusFilter === "draft"} onClick={() => setActiveStatusFilter("draft")} color="gray" />
            <StatusCard label="Confirmed" count={orderCounts.confirmed} active={activeStatusFilter === "confirmed"} onClick={() => setActiveStatusFilter("confirmed")} color="indigo" />
            <StatusCard label="Delivered" count={orderCounts.delivered} active={activeStatusFilter === "delivered"} onClick={() => setActiveStatusFilter("delivered")} color="green" />
            <StatusCard label="Invoiced" count={orderCounts.invoiced} active={activeStatusFilter === "invoiced"} onClick={() => setActiveStatusFilter("invoiced")} color="purple" />
            <StatusCard label="Cancelled" count={orderCounts.cancelled} active={activeStatusFilter === "cancelled"} onClick={() => setActiveStatusFilter("cancelled")} color="red" />
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
      />
    </div>
  );
};

// Status Card Component
const StatusCard = ({ label, count, active, onClick, color }) => {
  const colorStyles = {
    blue: { bg: active ? "bg-blue-600" : "bg-blue-50", text: active ? "text-white" : "text-blue-700" },
    gray: { bg: active ? "bg-gray-600" : "bg-gray-100", text: active ? "text-white" : "text-gray-700" },
    indigo: { bg: active ? "bg-indigo-600" : "bg-indigo-50", text: active ? "text-white" : "text-indigo-700" },
    green: { bg: active ? "bg-green-600" : "bg-green-50", text: active ? "text-white" : "text-green-700" },
    purple: { bg: active ? "bg-purple-600" : "bg-purple-50", text: active ? "text-white" : "text-purple-700" },
    red: { bg: active ? "bg-red-600" : "bg-red-50", text: active ? "text-white" : "text-red-700" },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <button
      onClick={onClick}
      className={`${styles.bg} rounded-xl p-3 text-left transition-all duration-200 hover:shadow-md`}
    >
      <p className={`text-xs font-medium ${styles.text}`}>{label}</p>
      <p className={`text-xl font-bold ${styles.text} mt-1`}>{count}</p>
    </button>
  );
};

export default SalesOrderPage;
