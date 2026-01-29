import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch, FiFileText, FiUsers, FiBox } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const SearchPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [results, setResults] = useState({ items: [], customers: [], salesOrders: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({ items: [], customers: [], salesOrders: [] });
        return;
      }
      setLoading(true);
      setError("");
      const result = await apiRequest(`${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`);
      if (result.success) {
        setResults(result.data || { items: [], customers: [], salesOrders: [] });
      } else {
        setError(result.error || "Search failed");
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  const hasResults = useMemo(() => {
    return (
      results.items.length ||
      results.customers.length ||
      results.salesOrders.length
    );
  }, [results]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FiSearch className="w-6 h-6 text-blue-600" />
            Global Search
          </h1>
          <p className="text-sm text-gray-500">
            Results for "<span className="font-medium">{query}</span>"
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-600">
            Searching...
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && !hasResults && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No results found.
          </div>
        )}

        {!loading && !error && hasResults && (
          <>
            <ResultGroup
              title="Medicines"
              icon={<FiBox className="w-5 h-5 text-blue-600" />}
              items={results.items}
              onClick={(item) => navigate(`/items?search=${encodeURIComponent(item.name)}`)}
              renderItem={(item) => `${item.name} (${item.sku || "N/A"})`}
            />

            <ResultGroup
              title="Customers"
              icon={<FiUsers className="w-5 h-5 text-green-600" />}
              items={results.customers}
              onClick={(customer) => navigate(`/sales/customers?search=${encodeURIComponent(customer.name)}`)}
              renderItem={(customer) => `${customer.name} (${customer.email})`}
            />

            <ResultGroup
              title="Sales Orders"
              icon={<FiFileText className="w-5 h-5 text-purple-600" />}
              items={results.salesOrders}
              onClick={(order) => navigate(`/sales/orders?search=${encodeURIComponent(order.orderNumber)}`)}
              renderItem={(order) => `${order.orderNumber} - ${order.status}`}
            />
          </>
        )}
      </div>
    </div>
  );
};

const ResultGroup = ({ title, icon, items, onClick, renderItem }) => (
  <div className="bg-white rounded-xl border border-gray-200">
    <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
      {icon}
      <span className="font-semibold text-gray-800">{title}</span>
    </div>
    <div className="divide-y">
      {items.length ? (
        items.map((item) => (
          <button
            key={item.id}
            onClick={() => onClick(item)}
            className="w-full text-left px-4 py-3 hover:bg-gray-50"
          >
            <p className="text-sm text-gray-900">{renderItem(item)}</p>
          </button>
        ))
      ) : (
        <div className="px-4 py-4 text-sm text-gray-500">No results</div>
      )}
    </div>
  </div>
);

export default SearchPage;
