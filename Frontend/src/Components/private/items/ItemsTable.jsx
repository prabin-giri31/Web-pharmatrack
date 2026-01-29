import { useState, useEffect, useMemo } from "react";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";
import { Package } from "lucide-react";

const ItemsTable = ({ view = "list", filter = "All Items" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items based on selected filter
  const filteredItems = useMemo(() => {
    switch (filter) {
      case "Active Items":
        return items.filter((item) => item.status === "active");
      case "Inactive Items":
        return items.filter((item) => item.status === "inactive");
      case "Low Stock Items":
        return items.filter((item) => (item.stockOnHand || 0) <= (item.reorderLevel || 0));
      case "All Items":
      default:
        return items;
    }
  }, [items, filter]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    setIsNetworkError(false);
    
    const result = await apiRequest(API_ENDPOINTS.items);
    
    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.error);
      setIsNetworkError(result.isNetworkError);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="text-gray-500">Loading items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`px-4 py-4 rounded ${isNetworkError ? "bg-yellow-50 border border-yellow-400" : "bg-red-100 border border-red-400"}`}>
        <div className={`font-medium ${isNetworkError ? "text-yellow-800" : "text-red-700"}`}>
          {isNetworkError ? "⚠️ Server Unavailable" : "Error"}
        </div>
        <p className={`text-sm mt-1 ${isNetworkError ? "text-yellow-700" : "text-red-600"}`}>
          {error}
        </p>
        <button
          onClick={fetchItems}
          className={`mt-3 px-4 py-2 text-sm rounded ${
            isNetworkError
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          Retry
        </button>
      </div>
    );
  }

  const handleMarkActive = async () => {
    try {
      const results = await Promise.all(
        selectedItems.map((id) =>
          apiRequest(`${API_ENDPOINTS.items}/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "active" }),
          })
        )
      );
      
      const hasError = results.some((r) => !r.success);
      if (hasError) {
        setError("Some items could not be updated");
      }
      
      fetchItems();
      setSelectedItems([]);
    } catch (err) {
      console.error("Error marking items as active:", err);
    }
  };

  const handleMarkInactive = async () => {
    try {
      const results = await Promise.all(
        selectedItems.map((id) =>
          apiRequest(`${API_ENDPOINTS.items}/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "inactive" }),
          })
        )
      );
      
      const hasError = results.some((r) => !r.success);
      if (hasError) {
        setError("Some items could not be updated");
      }
      
      fetchItems();
      setSelectedItems([]);
    } catch (err) {
      console.error("Error marking items as inactive:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      return;
    }
    try {
      const results = await Promise.all(
        selectedItems.map((id) =>
          apiRequest(`${API_ENDPOINTS.items}/${id}`, {
            method: "DELETE",
          })
        )
      );
      
      const hasError = results.some((r) => !r.success);
      if (hasError) {
        setError("Some items could not be deleted");
      }
      
      fetchItems();
      setSelectedItems([]);
    } catch (err) {
      console.error("Error deleting items:", err);
    }
  };

  // Grid View Layout
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {filteredItems.length === 0 ? (
        <div className="col-span-full text-center py-10 text-gray-500">
          No items found.
        </div>
      ) : (
        filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer ${
              selectedItems.includes(item.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  item.status === "active" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {item.status || "active"}
                </span>
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, item.id]);
                    } else {
                      setSelectedItems(selectedItems.filter((id) => id !== item.id));
                    }
                  }}
                />
              </div>
            </div>
            <h3 className="font-medium text-blue-600 truncate mb-1">{item.name}</h3>
            <p className="text-xs text-gray-500 mb-3">SKU: {item.sku || "-"}</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-400 text-xs">Stock</p>
                <p className="font-semibold text-gray-700">{item.stockOnHand || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Reorder</p>
                <p className="font-semibold text-gray-700">{item.reorderLevel || 0}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // List View Layout (Table)
  const ListView = () => (
    <div className="bg-white rounded-md border overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-3 sm:px-6 py-3 w-10">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(filteredItems.map((item) => item.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
              />
            </th>
            <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700">
              Name
            </th>
            <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700">
              SKU
            </th>
            <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700">
              Status
            </th>
            <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700">
              Stock
            </th>
            <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium text-gray-700">
              Reorder
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500">
                No items found.
              </td>
            </tr>
          ) : (
            filteredItems.map((item) => (
              <tr 
                key={item.id} 
                className={`border-b hover:bg-gray-50 ${selectedItems.includes(item.id) ? "bg-blue-50" : ""}`}
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter((id) => id !== item.id));
                      }
                    }}
                  />
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-blue-600 font-medium">{item.name}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                  {item.sku || "-"}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === "active" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {item.status || "active"}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                  {item.stockOnHand || 0}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                  {item.reorderLevel || 0}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-md border overflow-hidden">
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 px-3 sm:px-6 py-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs sm:text-sm text-blue-700">
            {selectedItems.length} item(s) selected
          </span>
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={handleMarkActive}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Active
            </button>
            <button
              onClick={handleMarkInactive}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Inactive
            </button>
            <button
              onClick={handleDelete}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      
      {view === "grid" ? <GridView /> : <ListView />}
    </div>
  );
};

export default ItemsTable;
