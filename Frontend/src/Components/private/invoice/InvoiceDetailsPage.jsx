import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiFileText, FiMail, FiPhone, FiUser, FiTruck, FiPlus, FiExternalLink } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError("");
      const result = await apiRequest(`${API_ENDPOINTS.invoices}/${id}`);
      if (result.success) {
        setInvoice(result.data);
      } else {
        setError(result.error || "Failed to load invoice");
      }
      setLoading(false);
    };

    fetchInvoice();
  }, [id]);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `Rs. ${num.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
      : "-";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-gray-600">Loading invoice...</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/sales/invoices")}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FiFileText className="w-6 h-6" />
                </span>
                Invoice Details
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{invoice.invoiceNumber}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="capitalize">{invoice.status}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="capitalize">{invoice.paymentStatus}</span>
              </div>
            </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate("/purchases/suppliers")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <FiExternalLink className="w-4 h-4" />
                Manage Vendors
              </button>
              <button
                onClick={() => navigate("/purchases/suppliers/new")}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                <FiPlus className="w-4 h-4" />
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <p className="font-semibold text-gray-900 text-lg">{invoice.customer?.name}</p>
              <p className="text-gray-600">{invoice.customer?.company || "-"}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <FiMail className="w-4 h-4" />
                <a href={`mailto:${invoice.customer?.email}`} className="text-blue-600 hover:underline">
                  {invoice.customer?.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiPhone className="w-4 h-4" />
                {invoice.customer?.phone || "-"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              Invoice Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date</span>
                <span className="font-medium text-gray-900">{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 capitalize">
                  {invoice.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment</span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 capitalize">
                  {invoice.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode</span>
                <span className="font-medium text-gray-900 capitalize">{invoice.paymentMode || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date</span>
                <span className="font-medium text-gray-900">{formatDate(invoice.paymentDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reference</span>
                <span className="font-medium text-gray-900">{invoice.paymentReference || "-"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiTruck className="w-4 h-4" />
              Vendor Information
            </h3>
            <div className="space-y-3">
              <p className="font-semibold text-gray-900 text-lg">{invoice.vendor?.name || invoice.supplier?.name || "No vendor linked"}</p>
              <p className="text-gray-600">{invoice.vendor?.company || invoice.supplier?.company || "-"}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <FiMail className="w-4 h-4" />
                {invoice.vendor?.email || invoice.supplier?.email ? (
                  <a
                    href={`mailto:${invoice.vendor?.email || invoice.supplier?.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {invoice.vendor?.email || invoice.supplier?.email}
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiPhone className="w-4 h-4" />
                {invoice.vendor?.phone || invoice.supplier?.phone || "-"}
              </div>
              <button
                onClick={() => navigate("/purchases/suppliers/new")}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                <FiPlus className="w-4 h-4" />
                Add vendor for this invoice
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Discount</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tax</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">SKU: {item.productSku || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-center">{item.discount}%</td>
                  <td className="px-4 py-3 text-center">{item.tax}%</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-red-600">-{formatCurrency(invoice.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Net Payable</span>
              <span className="font-bold text-xl text-blue-600">{formatCurrency(invoice.netPayable)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;
