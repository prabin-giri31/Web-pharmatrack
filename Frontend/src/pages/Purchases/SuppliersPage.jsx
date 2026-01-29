import { useEffect, useState } from "react";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500">Manage supplier information</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-600">
            Loading suppliers...
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y">
            {suppliers.length ? (
              suppliers.map((supplier) => (
                <div key={supplier.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{supplier.name}</p>
                    <p className="text-sm text-gray-500">{supplier.email || "No email"}</p>
                  </div>
                  <span className="text-sm text-gray-600">{supplier.status}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">No suppliers found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersPage;
