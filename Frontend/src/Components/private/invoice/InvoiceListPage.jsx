import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiPlus, FiSearch, FiRefreshCw } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    const result = await apiRequest(API_ENDPOINTS.invoices);
    if (result.success) {
      setInvoices(result.data || []);
    } else {
      setError(result.error || "Failed to load invoices");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter((invoice) =>
      invoice.invoiceNumber?.toLowerCase().includes(query) ||
      invoice.customer?.name?.toLowerCase().includes(query) ||
      invoice.customer?.company?.toLowerCase().includes(query)
    );
  }, [invoices, searchQuery]);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `Rs. ${num.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "-";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FiFileText className="w-7 h-7 text-blue-600" />
                Invoices
              </h1>
              <p className="mt-1 text-sm text-gray-500">Create and track invoices for direct sales</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchInvoices}
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/sales/invoices/new")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <FiPlus className="w-4 h-4" />
                New Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number or customer..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
            Loading invoices...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-4">Create a new invoice to get started with direct sales.</p>
            <button
              onClick={() => navigate("/sales/invoices/new")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FiPlus className="w-4 h-4" />
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-blue-600">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.customer?.name}</p>
                        <p className="text-sm text-gray-500">{invoice.customer?.company || "-"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(invoice.invoiceDate)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(invoice.netPayable)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${invoice.paymentStatus === "paid" ? "bg-green-100 text-green-700 border border-green-200" : "bg-yellow-100 text-yellow-700 border border-yellow-200"}`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/sales/invoices/${invoice.id}`)}
                        className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceListPage;
