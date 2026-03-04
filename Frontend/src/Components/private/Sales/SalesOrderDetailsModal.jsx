import React, { useEffect, useRef } from "react";
import {
  FiX,
  FiEdit2,
  FiCheck,
  FiXCircle,
  FiCopy,
  FiFileText,
  FiPrinter,
  FiMail,
  FiDownload,
  FiCalendar,
  FiUser,
  FiPhone,
  FiMail as FiMailIcon,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const SalesOrderDetailsModal = ({
  isOpen,
  onClose,
  order,
  onEdit,
  onConfirm,
  onCancel,
  onConvertToInvoice,
  onDuplicate,
  onMarkDelivered,
}) => {
  const modalRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatStatus = (status) => {
    return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert("PDF download functionality coming soon!");
  };

  const handleEmail = () => {
    alert(`Email will be sent to: ${order.customer.email}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden print:shadow-none print:my-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 print:bg-white print:border-gray-300">
          <div className="flex items-center gap-4">
            <div className="print:hidden">
              <FiFileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white print:text-gray-900">
                Sales Order Details
              </h2>
              <p className="text-blue-100 print:text-gray-600">{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors print:hidden"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Status & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${getStatusBadge(order.status)}`}>
                {formatStatus(order.status)}
              </span>
              <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                {formatStatus(order.paymentStatus)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {order.status === "draft" && (
                <>
                  <button
                    onClick={() => { onEdit(order); onClose(); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => { onConfirm(order); onClose(); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <FiCheck className="w-4 h-4" />
                    Confirm
                  </button>
                </>
              )}
              {order.status === "confirmed" && onMarkDelivered && (
                <button
                  onClick={() => { onMarkDelivered(order); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700"
                >
                  <FiTruck className="w-4 h-4" />
                  Mark Delivered
                </button>
              )}
              {order.status === "delivered" && (
                <button
                  onClick={() => { onConvertToInvoice(order); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  <FiFileText className="w-4 h-4" />
                  Convert to Invoice
                </button>
              )}
              <button
                onClick={() => { onDuplicate(order); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiCopy className="w-4 h-4" />
                Duplicate
              </button>
              {order.status !== "cancelled" && order.status !== "invoiced" && (
                <button
                  onClick={() => { onCancel(order); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                >
                  <FiXCircle className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <p className="font-semibold text-gray-900 text-lg">{order.customer.name}</p>
                <p className="text-gray-600">{order.customer.company}</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMailIcon className="w-4 h-4" />
                  <a href={`mailto:${order.customer.email}`} className="text-blue-600 hover:underline">
                    {order.customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPhone className="w-4 h-4" />
                  {order.customer.phone}
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                Order Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900">{formatDate(order.orderDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Delivery</span>
                  <span className="font-medium text-gray-900">{formatDate(order.expectedDeliveryDate)}</span>
                </div>
                {order.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Due</span>
                    <span className="font-medium text-gray-900">{formatDate(order.dueDate)}</span>
                  </div>
                )}
                {order.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiPackage className="w-4 h-4" />
              Order Items ({order.items.length})
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Discount</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tax</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, index) => {
                    const unitPrice = parseFloat(item.unitPrice) || 0;
                    const quantity = item.quantity || 0;
                    const discount = parseFloat(item.discount) || 0;
                    const tax = parseFloat(item.tax) || 0;
                    
                    const subtotal = quantity * unitPrice;
                    const discountAmount = (subtotal * discount) / 100;
                    const afterDiscount = subtotal - discountAmount;
                    const taxAmount = (afterDiscount * tax) / 100;
                    const total = item.lineTotal ? parseFloat(item.lineTotal) : afterDiscount + taxAmount;
                    
                    // Handle both product object and flat item properties from backend
                    const productName = item.product?.name || item.productName || "Unknown Product";
                    const productSku = item.product?.sku || item.productSku || "-";

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{productName}</p>
                          <p className="text-sm text-gray-500">SKU: {productSku}</p>
                        </td>
                        <td className="px-4 py-3 text-center">{quantity}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(unitPrice)}</td>
                        <td className="px-4 py-3 text-center">{discount}%</td>
                        <td className="px-4 py-3 text-center">{tax}%</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">-{formatCurrency(order.totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatCurrency(order.totalTax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Grand Total</span>
                <span className="font-bold text-xl text-blue-600">{formatCurrency(order.grandTotal)}</span>
              </div>
              {order.advancePayment > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Advance Paid</span>
                    <span className="font-medium text-green-600">-{formatCurrency(order.advancePayment)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Balance Due</span>
                    <span className="text-gray-900">{formatCurrency(order.grandTotal - order.advancePayment)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Notes</h4>
              <p className="text-yellow-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiPrinter className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiDownload className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiMail className="w-4 h-4" />
              Email
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetailsModal;
