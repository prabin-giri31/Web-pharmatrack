import React, { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiUsers, FiDownload, FiRefreshCw, FiLoader } from "react-icons/fi";
import FilterTabs from "../../Components/private/Sales/FilterTabs";
import CustomerTable from "../../Components/private/Sales/CustomerTable";
import AddCustomerModal from "../../Components/private/Sales/AddCustomerModal";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const CustomerPage = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [customViews, setCustomViews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    const result = await apiRequest(API_ENDPOINTS.customers);
    
    if (result.success) {
      setCustomers(result.data || []);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on active filter and search query
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Apply status filter
    if (activeFilter !== "all" && !activeFilter.startsWith("custom-")) {
      result = result.filter((customer) => customer.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.company?.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.phone?.includes(query)
      );
    }

    return result;
  }, [customers, activeFilter, searchQuery]);

  // Get customer count by status
  const customerCounts = useMemo(() => {
    return {
      all: customers.length,
      active: customers.filter((c) => c.status === "active").length,
      inactive: customers.filter((c) => c.status === "inactive").length,
      overdue: customers.filter((c) => c.status === "overdue").length,
      unpaid: customers.filter((c) => c.status === "unpaid").length,
    };
  }, [customers]);

  // Handlers
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleAddCustomView = (newView) => {
    setCustomViews((prev) => [...prev, newView]);
  };

  const handleSaveCustomer = async (customerData) => {
    if (editingCustomer) {
      // Update existing customer
      const result = await apiRequest(`${API_ENDPOINTS.customers}/${customerData.id}`, {
        method: "PATCH",
        body: JSON.stringify(customerData),
      });
      
      if (result.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerData.id ? result.data : c))
        );
        setEditingCustomer(null);
      }
      return result;
    } else {
      // Add new customer
      const result = await apiRequest(API_ENDPOINTS.customers, {
        method: "POST",
        body: JSON.stringify(customerData),
      });
      
      if (result.success) {
        setCustomers((prev) => [result.data, ...prev]);
        setEditingCustomer(null);
      }
      return result;
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      const result = await apiRequest(`${API_ENDPOINTS.customers}/${customer.id}`, {
        method: "DELETE",
      });
      
      if (result.success) {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      }
    }
  };

  const handleViewCustomer = (customer) => {
    // For now, just open edit modal (can be changed to a view-only modal later)
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchCustomers();
    setSearchQuery("");
    setActiveFilter("all");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title & Stats */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FiUsers className="w-7 h-7 text-blue-600" />
                Customers
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your customer relationships and information
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
              <button
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => {
                  setEditingCustomer(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            <StatCard
              label="Total"
              count={customerCounts.all}
              color="blue"
              active={activeFilter === "all"}
              onClick={() => handleFilterChange("all")}
            />
            <StatCard
              label="Active"
              count={customerCounts.active}
              color="green"
              active={activeFilter === "active"}
              onClick={() => handleFilterChange("active")}
            />
            <StatCard
              label="Inactive"
              count={customerCounts.inactive}
              color="gray"
              active={activeFilter === "inactive"}
              onClick={() => handleFilterChange("inactive")}
            />
            <StatCard
              label="Overdue"
              count={customerCounts.overdue}
              color="red"
              active={activeFilter === "overdue"}
              onClick={() => handleFilterChange("overdue")}
            />
            <StatCard
              label="Unpaid"
              count={customerCounts.unpaid}
              color="yellow"
              active={activeFilter === "unpaid"}
              onClick={() => handleFilterChange("unpaid")}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        customViews={customViews}
        onAddCustomView={handleAddCustomView}
      />

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers by name, company, email, or phone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredCustomers.length}</span> of{" "}
            <span className="font-semibold">{customers.length}</span> customers
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FiLoader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading customers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Customer Table */}
        {!loading && !error && (
          <CustomerTable
            customers={filteredCustomers}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onView={handleViewCustomer}
          />
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        editingCustomer={editingCustomer}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, count, color, active, onClick }) => {
  const colorStyles = {
    blue: {
      bg: active ? "bg-blue-600" : "bg-blue-50",
      text: active ? "text-white" : "text-blue-700",
      count: active ? "text-white" : "text-blue-900",
    },
    green: {
      bg: active ? "bg-green-600" : "bg-green-50",
      text: active ? "text-white" : "text-green-700",
      count: active ? "text-white" : "text-green-900",
    },
    gray: {
      bg: active ? "bg-gray-600" : "bg-gray-100",
      text: active ? "text-white" : "text-gray-600",
      count: active ? "text-white" : "text-gray-900",
    },
    red: {
      bg: active ? "bg-red-600" : "bg-red-50",
      text: active ? "text-white" : "text-red-700",
      count: active ? "text-white" : "text-red-900",
    },
    yellow: {
      bg: active ? "bg-yellow-500" : "bg-yellow-50",
      text: active ? "text-white" : "text-yellow-700",
      count: active ? "text-white" : "text-yellow-900",
    },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <button
      onClick={onClick}
      className={`${styles.bg} rounded-xl p-3 sm:p-4 text-left transition-all duration-200 hover:shadow-md ${
        active ? "ring-2 ring-offset-2 ring-" + color + "-500" : ""
      }`}
    >
      <p className={`text-xs sm:text-sm font-medium ${styles.text}`}>{label}</p>
      <p className={`text-xl sm:text-2xl font-bold ${styles.count} mt-1`}>{count}</p>
    </button>
  );
};

export default CustomerPage;
