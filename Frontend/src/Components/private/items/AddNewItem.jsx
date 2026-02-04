// AddNewItem.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";
import { itemSchema } from "../schema/itemSchema";

const AddNewItem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unit: "",
    category: "",
    returnable: true,
    sellingPrice: "",
    costPrice: "",
    stockOnHand: "",
    reorderLevel: "",
    description: "",
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsNetworkError(false);
    setFieldErrors({});

    // Zod validation
    const validationResult = itemSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0]] = err.message;
        }
      });
      setFieldErrors(errors);
      setError("Please fix the validation errors");
      return;
    }

    setLoading(true);

    const apiResult = await apiRequest(API_ENDPOINTS.items, {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (apiResult.success) {
      // Success - redirect to items list
      alert("Item saved successfully!");
      navigate("/items");
    } else {
      setError(apiResult.error);
      setIsNetworkError(apiResult.isNetworkError);
    }
    
    setLoading(false);
  };

  const handleLeave = () => {
    navigate("/items"); // adjust to your items page route
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl relative">

      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Add New Item</h2>

      {/* ERROR MESSAGE */}
      {error && (
        <div className={`px-4 py-2 rounded mb-4 text-sm ${
          isNetworkError 
            ? "bg-yellow-50 border border-yellow-400 text-yellow-700" 
            : "bg-red-100 border border-red-400 text-red-700"
        }`}>
          {isNetworkError && "⚠️ "}{error}
        </div>
      )}

      {/* FORM */}
      <form id="add-item-form" onSubmit={handleSubmit} className="space-y-8 pb-24">

        {/* NEW ITEMS SECTION */}
        <div className="bg-white p-4 sm:p-6 rounded-md border">
          <h3 className="text-base sm:text-lg font-medium mb-4">New Items</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select category</option>
                <option value="Medicine">Medicine</option>
                <option value="Equipment">Equipment</option>
                <option value="Supplement">Supplement</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              name="returnable"
              checked={formData.returnable}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm">Returnable Item</label>
          </div>
        </div>

        {/* SALES INFORMATION SECTION */}
        <div className="bg-white p-4 sm:p-6 rounded-md border">
          <h3 className="text-base sm:text-lg font-medium mb-4">Sales Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Selling Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cost Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock on Hand</label>
              <input
                type="number"
                name="stockOnHand"
                value={formData.stockOnHand}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

      </form>

      {/* FIXED ACTION BAR */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t px-6 py-4 flex justify-end gap-3 z-40">
        <button
          type="submit"
          form="add-item-form"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Item"}
        </button>

        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FiAlertTriangle className="text-yellow-500 text-2xl" />
              <h3 className="text-lg font-semibold">Leave this page?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              If you leave, your unsaved changes will be discarded.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-md border hover:bg-gray-100"
              >
                Stay here
              </button>
              <button
                onClick={handleLeave}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Leave & discard changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddNewItem;
