import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiPlus, FiX, FiUser, FiChevronDown } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../../config/api";

// Dummy customers data
const dummyCustomers = [
  { id: 1, name: "John Smith", company: "Tech Solutions Inc.", email: "john@techsolutions.com", phone: "+1 555-0101", billingAddress: "123 Tech Street, Suite 100\nSan Francisco, CA 94102", shippingAddress: "123 Tech Street, Suite 100\nSan Francisco, CA 94102" },
  { id: 2, name: "Sarah Johnson", company: "HealthCare Plus", email: "sarah@healthcareplus.com", phone: "+1 555-0102", billingAddress: "456 Medical Drive\nNew York, NY 10001", shippingAddress: "789 Warehouse Blvd\nNew York, NY 10002" },
  { id: 3, name: "Michael Brown", company: "Brown Enterprises", email: "michael@brownent.com", phone: "+1 555-0103", billingAddress: "321 Business Park\nChicago, IL 60601", shippingAddress: "321 Business Park\nChicago, IL 60601" },
  { id: 4, name: "Emily Davis", company: "MediSupply Co.", email: "emily@medisupply.com", phone: "+1 555-0104", billingAddress: "555 Commerce Way\nLos Angeles, CA 90001", shippingAddress: "555 Commerce Way\nLos Angeles, CA 90001" },
  { id: 5, name: "Robert Wilson", company: "Wilson Pharmacy", email: "robert@wilsonpharm.com", phone: "+1 555-0105", billingAddress: "777 Pharmacy Lane\nHouston, TX 77001", shippingAddress: "888 Distribution Center\nHouston, TX 77002" },
];

const CustomerSelect = ({ selectedCustomer, onSelect, onAddNew, customers: customersProp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState(customersProp || []);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (customersProp) {
      setCustomers(customersProp);
    }
  }, [customersProp]);

  useEffect(() => {
    if (customersProp) return;
    const fetchCustomers = async () => {
      const result = await apiRequest(API_ENDPOINTS.customers);
      if (result.success) {
        setCustomers(result.data || []);
      }
    };
    fetchCustomers();
  }, [customersProp]);

  const filteredCustomers = (customers.length ? customers : dummyCustomers).filter(
    (customer) =>
      (customer.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (customer) => {
    onSelect(customer);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Customer Display / Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
          isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300 hover:border-gray-400"
        } ${selectedCustomer ? "bg-white" : "bg-gray-50"}`}
      >
        {selectedCustomer ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {selectedCustomer.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-500">{selectedCustomer.company}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select or add a customer</span>
        )}
        <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Add New Customer Button */}
          <button
            onClick={() => {
              onAddNew();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 border-b border-gray-200 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span className="font-medium">Add New Customer</span>
          </button>

          {/* Customer List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors text-left ${
                    selectedCustomer?.id === customer.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                    <p className="text-sm text-gray-500 truncate">{customer.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{customer.email}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                No customers found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Customer Details Card */}
      {selectedCustomer && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Company</p>
              <p className="font-medium text-gray-900">{selectedCustomer.company}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <a href={`mailto:${selectedCustomer.email}`} className="font-medium text-blue-600 hover:underline">
                {selectedCustomer.email}
              </a>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Phone</p>
              <p className="font-medium text-gray-900">{selectedCustomer.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { CustomerSelect, dummyCustomers };
export default CustomerSelect;
