import React from "react";
import { FiSearch, FiFilter, FiChevronDown, FiX, FiCalendar } from "react-icons/fi";

const SalesOrderFilters = ({
  searchQuery,
  onSearchChange,
  activePaymentFilter,
  onPaymentFilterChange,
  selectedCustomer,
  onCustomerChange,
  dateRange,
  onDateRangeChange,
  customers,
  showFilters,
  onToggleFilters,
}) => {
  const paymentFilters = [
    { id: "all", label: "All Payments" },
    { id: "unpaid", label: "Unpaid" },
    { id: "partially_paid", label: "Partially Paid" },
    { id: "paid", label: "Paid" },
    { id: "overdue", label: "Overdue" },
  ];

  const clearFilters = () => {
    onPaymentFilterChange("all");
    onCustomerChange("all");
    onDateRangeChange({ start: "", end: "" });
    onSearchChange("");
  };

  const hasActiveFilters =
    activePaymentFilter !== "all" ||
    selectedCustomer !== "all" ||
    dateRange.start ||
    dateRange.end ||
    searchQuery;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by order number or customer..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            )}
            <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
            >
              <FiX className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={activePaymentFilter}
                  onChange={(e) => onPaymentFilterChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {paymentFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => onCustomerChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date From
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date To
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Quick Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          {paymentFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onPaymentFilterChange(filter.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                activePaymentFilter === filter.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesOrderFilters;
