import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FiDatabase,
  FiDownload,
  FiUpload,
  FiLoader,
  FiAlertTriangle,
  FiCheck,
  FiFileText,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { formatCurrency, formatDate } from "../../utils/formatters";

const DataManagement = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [backupInfo, setBackupInfo] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [exportType, setExportType] = useState("all");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiRequest(
        `${API_ENDPOINTS.superAdmin.dataExport}?type=${exportType}`
      );
      if (result.success) {
        setExportData(result.data);
        
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pharmatrack-export-${exportType}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setSuccessMessage("Data exported successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error || "Failed to export data");
      }
    } catch (err) {
      setError("Failed to export data");
    } finally {
      setLoading(false);
    }
  }, [exportType]);

  const handleBackup = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiRequest(API_ENDPOINTS.superAdmin.backup, {
        method: "POST",
      });
      if (result.success) {
        setBackupInfo(result.data);
        setSuccessMessage("Backup information generated");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error || "Failed to create backup");
      }
    } catch (err) {
      setError("Failed to create backup");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerateReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (reportStartDate) params.set("startDate", reportStartDate);
      if (reportEndDate) params.set("endDate", reportEndDate);
      
      const result = await apiRequest(
        `${API_ENDPOINTS.superAdmin.reports}?${params.toString()}`
      );
      if (result.success) {
        setReport(result.data);
      } else {
        setError(result.error || "Failed to generate report");
      }
    } catch (err) {
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  }, [reportStartDate, reportEndDate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiDatabase className="w-6 h-6" />
            Data Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Export data, create backups, and generate reports</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <FiCheck className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Data */}
          <div id="export" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiDownload className="w-4 h-4" />
                Export Data
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Export system data as JSON file for backup or analysis.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Export Type
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Data</option>
                  <option value="users">Users Only</option>
                  <option value="items">Medicines Only</option>
                  <option value="customers">Customers Only</option>
                  <option value="invoices">Invoices Only</option>
                  <option value="settings">Settings Only</option>
                </select>
              </div>
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiDownload className="w-4 h-4" />
                )}
                Export Data
              </button>
            </div>
          </div>

          {/* Backup */}
          <div id="backup" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiUpload className="w-4 h-4" />
                Database Backup
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Generate backup information and database statistics.
              </p>
              <button
                onClick={handleBackup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiDatabase className="w-4 h-4" />
                )}
                Generate Backup Info
              </button>
              
              {backupInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">Backup Info</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Generated: {formatDate(backupInfo.timestamp)}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-4 h-4 text-blue-500" />
                      <span>Users: {backupInfo.statistics?.users}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPackage className="w-4 h-4 text-green-500" />
                      <span>Items: {backupInfo.statistics?.items}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiFileText className="w-4 h-4 text-purple-500" />
                      <span>Invoices: {backupInfo.statistics?.invoices}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiShoppingCart className="w-4 h-4 text-orange-500" />
                      <span>Orders: {backupInfo.statistics?.salesOrders}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reports */}
        <div id="report" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4" />
              Summary Report
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-gray-400" />
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiBarChart2 className="w-4 h-4" />
                )}
                Generate Report
              </button>
            </div>

            {report && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Report Period: {report.period.startDate} to {formatDate(report.period.endDate)}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(report.summary.totalSales)}
                    </p>
                    <p className="text-sm text-blue-700">Total Sales</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {report.summary.invoiceCount}
                    </p>
                    <p className="text-sm text-green-700">Invoices</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {report.summary.newUsers}
                    </p>
                    <p className="text-sm text-purple-700">New Users</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {report.summary.newCustomers}
                    </p>
                    <p className="text-sm text-orange-700">New Customers</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {report.summary.activityCount}
                    </p>
                    <p className="text-sm text-indigo-700">Activities</p>
                  </div>
                </div>

                {report.topItems?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Top Items by Stock</p>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {report.topItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{item.sku}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
