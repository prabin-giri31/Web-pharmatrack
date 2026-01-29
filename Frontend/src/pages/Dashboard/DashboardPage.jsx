import { useEffect, useState } from "react";
import { FiBox, FiTrendingUp, FiAlertTriangle, FiFileText } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    const result = await apiRequest(`${API_ENDPOINTS.dashboard}/summary`);
    if (result.success) {
      setSummary(result.data);
    } else {
      setError(result.error || "Failed to load dashboard");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of pharmacy performance</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
            Loading dashboard...
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchSummary}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && summary && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<FiBox className="w-6 h-6 text-blue-600" />}
                label="Total Medicines"
                value={summary.totalItems}
              />
              <StatCard
                icon={<FiAlertTriangle className="w-6 h-6 text-red-600" />}
                label="Low Stock"
                value={summary.lowStockItems}
              />
              <StatCard
                icon={<FiTrendingUp className="w-6 h-6 text-green-600" />}
                label="Today's Sales (NPR)"
                value={Number(summary.todaysSales || 0).toFixed(2)}
              />
              <StatCard
                icon={<FiFileText className="w-6 h-6 text-purple-600" />}
                label="Recent Orders"
                value={summary.recentOrders?.length || 0}
              />
            </div>

            <div className="mt-6 bg-white rounded-xl border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-800">
                Recent Sales Orders
              </div>
              <div className="divide-y">
                {(summary.recentOrders || []).map((order) => (
                  <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.status}</p>
                    </div>
                    <div className="text-sm text-gray-700">NPR {Number(order.grandTotal || 0).toFixed(2)}</div>
                  </div>
                ))}
                {summary.recentOrders?.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-500">No recent orders</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default DashboardPage;
