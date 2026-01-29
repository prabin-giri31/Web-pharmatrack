import React, { useState } from "react";
import {
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiX,
  FiFileText,
  FiPrinter,
  FiMail,
  FiTruck,
  FiAlertCircle,
} from "react-icons/fi";

const SalesOrderList = ({
  orders,
  onView,
  onEdit,
  onDelete,
  onCancel,
  onConfirm,
  onDuplicate,
  onConvertToInvoice,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);

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
      draft: "bg-gray-100 text-gray-700 border border-gray-200",
      confirmed: "bg-indigo-100 text-indigo-700 border border-indigo-200",
      delivered: "bg-green-100 text-green-700 border border-green-200",
      invoiced: "bg-purple-100 text-purple-700 border border-purple-200",
      cancelled: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || styles.draft;
  };

  const getPaymentBadge = (status) => {
    const styles = {
      unpaid: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      partially_paid: "bg-blue-100 text-blue-700 border border-blue-200",
      paid: "bg-green-100 text-green-700 border border-green-200",
      overdue: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || styles.unpaid;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatStatus = (status) => {
    return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiFileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sales orders found</h3>
        <p className="text-gray-500">Try adjusting your filters or create a new sales order.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order #
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Items
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Payment
              </th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                onClick={() => onView(order)}
              >
                <td className="px-6 py-4">
                  <span className="font-semibold text-blue-600 hover:text-blue-800">
                    {order.orderNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                    <p className="text-sm text-gray-500">{order.customer.company}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-gray-900">{formatDate(order.orderDate)}</p>
                    <p className="text-sm text-gray-500">Due: {formatDate(order.expectedDeliveryDate)}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{order.items.length} item(s)</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-gray-900">{formatCurrency(order.grandTotal)}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                    {formatStatus(order.paymentStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="relative inline-block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(order.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    {openMenuId === order.id && (
                      <ActionMenu
                        order={order}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onCancel={onCancel}
                        onConfirm={onConfirm}
                        onDuplicate={onDuplicate}
                        onConvertToInvoice={onConvertToInvoice}
                        onClose={() => setOpenMenuId(null)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-100">
        {orders.map((order) => (
          <div key={order.id} className="p-4 hover:bg-gray-50" onClick={() => onView(order)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-semibold text-blue-600">{order.orderNumber}</span>
                <p className="font-medium text-gray-900 mt-1">{order.customer.name}</p>
                <p className="text-sm text-gray-500">{order.customer.company}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                  {formatStatus(order.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-gray-500">Order Date</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-semibold text-gray-900">{formatCurrency(order.grandTotal)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                {formatStatus(order.paymentStatus)}
              </span>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onView(order)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <FiEye className="w-4 h-4" />
                </button>
                {order.status === "draft" && (
                  <button
                    onClick={() => onEdit(order)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDuplicate(order)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Action Menu Component
const ActionMenu = ({
  order,
  onView,
  onEdit,
  onDelete,
  onCancel,
  onConfirm,
  onDuplicate,
  onConvertToInvoice,
  onClose,
}) => {
  const handleAction = (action) => {
    action(order);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
      <button
        onClick={() => handleAction(onView)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <FiEye className="w-4 h-4" />
        View Details
      </button>

      {order.status === "draft" && (
        <>
          <button
            onClick={() => handleAction(onEdit)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Order
          </button>
          <button
            onClick={() => handleAction(onConfirm)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
          >
            <FiCheck className="w-4 h-4" />
            Confirm Order
          </button>
        </>
      )}

      {order.status === "delivered" && (
        <button
          onClick={() => handleAction(onConvertToInvoice)}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
        >
          <FiFileText className="w-4 h-4" />
          Convert to Invoice
        </button>
      )}

      <button
        onClick={() => handleAction(onDuplicate)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <FiCopy className="w-4 h-4" />
        Duplicate Order
      </button>

      <div className="border-t border-gray-100 my-1"></div>

      <button
        onClick={() => alert("Print functionality coming soon!")}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <FiPrinter className="w-4 h-4" />
        Print Order
      </button>

      <button
        onClick={() => alert("Email functionality coming soon!")}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <FiMail className="w-4 h-4" />
        Email to Customer
      </button>

      {order.status !== "cancelled" && order.status !== "invoiced" && (
        <>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => handleAction(onCancel)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <FiX className="w-4 h-4" />
            Cancel Order
          </button>
        </>
      )}

      {order.status === "draft" && (
        <button
          onClick={() => handleAction(onDelete)}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <FiTrash2 className="w-4 h-4" />
          Delete Order
        </button>
      )}
    </div>
  );
};

export default SalesOrderList;
