import React from "react";
import { FiUser, FiMail, FiPhone, FiMoreVertical, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

const CustomerTable = ({ customers, onEdit, onDelete, onView }) => {
  const [openMenuId, setOpenMenuId] = React.useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700 border border-green-200",
      inactive: "bg-gray-100 text-gray-600 border border-gray-200",
      overdue: "bg-red-100 text-red-700 border border-red-200",
      unpaid: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    };
    return styles[status] || styles.active;
  };

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiUser className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
        <p className="text-gray-500">Try adjusting your filters or add a new customer.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Company Name
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {customer.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{customer.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{customer.company || "-"}</td>
                <td className="px-6 py-4">
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {customer.email}
                  </a>
                </td>
                <td className="px-6 py-4 text-gray-600">{customer.phone || "-"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(
                      customer.status
                    )}`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(customer.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    {openMenuId === customer.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            onView?.(customer);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiEye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            onEdit?.(customer);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          Edit Customer
                        </button>
                        <button
                          onClick={() => {
                            onDelete?.(customer);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete Customer
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {customers.map((customer) => (
          <div key={customer.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {customer.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">{customer.company || "No company"}</p>
                </div>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(
                  customer.status
                )}`}
              >
                {customer.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FiMail className="w-4 h-4" />
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiPhone className="w-4 h-4" />
                <span>{customer.phone || "-"}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => onView?.(customer)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                <FiEye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => onEdit?.(customer)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete?.(customer)}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerTable;
