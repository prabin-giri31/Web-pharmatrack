import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { FiPlus, FiSearch, FiMail, FiPhone, FiStar, FiMoreVertical, FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      const result = await apiRequest(API_ENDPOINTS.suppliers);
      if (result.success) {
        setSuppliers(result.data || []);
      }
      setLoading(false);
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear message after 3 seconds
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const filteredSuppliers = suppliers.filter(supplier => {
    const name = supplier.displayName || supplier.companyName || supplier.name || "";
    const email = supplier.email || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getInitials = (name) => {
    if (!name) return "V";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700";
      case "inactive": return "bg-gray-100 text-gray-600";
      default: return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendors</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your vendor and supplier relationships</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/purchases/suppliers/new")}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 font-medium"
            >
              <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Add New Vendor</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Message */}
        {message && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 shadow-sm animate-fade-in">
            <div className="p-1 bg-green-200 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Vendors</p>
                <p className="text-2xl font-bold text-green-600">
                  {suppliers.filter(s => (s.status || "active").toLowerCase() === "active").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiStar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Preferred</p>
                <p className="text-2xl font-bold text-amber-600">
                  {suppliers.filter(s => s.preferredSupplier).length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <FiStar className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Vendors List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 animate-pulse">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-gray-600 font-medium">Loading vendors...</p>
          </div>
        ) : filteredSuppliers.length ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/purchases/suppliers/${supplier.id}`)}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {getInitials(supplier.displayName || supplier.companyName || supplier.name)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {supplier.displayName || supplier.companyName || supplier.name}
                      </p>
                      {supplier.preferredSupplier && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <FiStar className="w-3 h-3" /> Preferred
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      {supplier.email && (
                        <span className="inline-flex items-center gap-1">
                          <FiMail className="w-4 h-4" /> {supplier.email}
                        </span>
                      )}
                      {supplier.phone && (
                        <span className="inline-flex items-center gap-1">
                          <FiPhone className="w-4 h-4" /> {supplier.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(supplier.status)}`}>
                      {supplier.status || "Active"}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/purchases/suppliers/${supplier.id}/edit`); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FiUsers className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No vendors found" : "No vendors yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchTerm
                ? `No vendors match "${searchTerm}". Try a different search term.`
                : "Get started by adding your first vendor to manage your supply chain effectively."}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={() => navigate("/purchases/suppliers/new")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all font-medium"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Your First Vendor</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersPage;
