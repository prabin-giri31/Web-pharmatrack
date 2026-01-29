import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiLayers,
  FiSearch,
  FiSettings,
  FiTag,
  FiActivity,
  FiLoader,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../../config/api";

const ItemsGroup = () => {
  // Dynamic Medicine Types
  const [medicineTypes, setMedicineTypes] = useState([]);

  // Dynamic Disease Categories
  const [diseaseCategories, setDiseaseCategories] = useState([]);

  // Item Groups Data
  const [itemGroups, setItemGroups] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Group Form Modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    medicineType: "",
    diseaseCategory: "",
    description: "",
  });
  const [groupErrors, setGroupErrors] = useState({});

  // Type Management Modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newType, setNewType] = useState("");
  const [editingType, setEditingType] = useState(null);

  // Category Management Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({ show: false, type: "", id: null, name: "" });

  // ==================== FILTER LOGIC ====================
  const filteredGroups = itemGroups.filter((group) => {
    const matchesSearch =
      group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? group.medicineType === filterType : true;
    const matchesCategory = filterCategory ? group.diseaseCategory === filterCategory : true;
    return matchesSearch && matchesType && matchesCategory;
  });

  // ==================== GROUP CRUD ====================
  const openAddGroupModal = () => {
    setEditingGroup(null);
    setGroupForm({ groupName: "", medicineType: "", diseaseCategory: "", description: "" });
    setGroupErrors({});
    setShowGroupModal(true);
  };

  const openEditGroupModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      groupName: group.groupName,
      medicineType: group.medicineType,
      diseaseCategory: group.diseaseCategory,
      description: group.description || "",
    });
    setGroupErrors({});
    setShowGroupModal(true);
  };

  const validateGroupForm = () => {
    const errors = {};
    if (!groupForm.groupName.trim()) errors.groupName = "Group name is required";
    if (!groupForm.medicineType) errors.medicineType = "Medicine type is required";
    if (!groupForm.diseaseCategory) errors.diseaseCategory = "Disease category is required";
    setGroupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    if (!validateGroupForm()) return;

    if (editingGroup) {
      setItemGroups((prev) =>
        prev.map((g) => (g.id === editingGroup.id ? { ...g, ...groupForm } : g))
      );
    } else {
      setItemGroups((prev) => [...prev, { id: Date.now(), ...groupForm }]);
    }
    setShowGroupModal(false);
  };

  const confirmDeleteGroup = (group) => {
    setDeleteModal({ show: true, type: "group", id: group.id, name: group.groupName });
  };

  // ==================== TYPE MANAGEMENT ====================
  const handleAddType = () => {
    if (newType.trim() && !medicineTypes.includes(newType.trim())) {
      setMedicineTypes((prev) => [...prev, newType.trim()]);
      setNewType("");
    }
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setNewType(type);
  };

  const handleUpdateType = () => {
    if (newType.trim() && editingType) {
      setMedicineTypes((prev) => prev.map((t) => (t === editingType ? newType.trim() : t)));
      setItemGroups((prev) =>
        prev.map((g) => (g.medicineType === editingType ? { ...g, medicineType: newType.trim() } : g))
      );
      setEditingType(null);
      setNewType("");
    }
  };

  const confirmDeleteType = (type) => {
    setDeleteModal({ show: true, type: "medicineType", id: type, name: type });
  };

  // ==================== CATEGORY MANAGEMENT ====================
  const handleAddCategory = () => {
    if (newCategory.trim() && !diseaseCategories.includes(newCategory.trim())) {
      setDiseaseCategories((prev) => [...prev, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory(category);
  };

  const handleUpdateCategory = () => {
    if (newCategory.trim() && editingCategory) {
      setDiseaseCategories((prev) => prev.map((c) => (c === editingCategory ? newCategory.trim() : c)));
      setItemGroups((prev) =>
        prev.map((g) => (g.diseaseCategory === editingCategory ? { ...g, diseaseCategory: newCategory.trim() } : g))
      );
      setEditingCategory(null);
      setNewCategory("");
    }
  };

  const confirmDeleteCategory = (category) => {
    setDeleteModal({ show: true, type: "diseaseCategory", id: category, name: category });
  };

  // ==================== CONFIRM DELETE ====================
  const handleConfirmDelete = () => {
    const { type, id } = deleteModal;
    if (type === "group") {
      setItemGroups((prev) => prev.filter((g) => g.id !== id));
    } else if (type === "medicineType") {
      setMedicineTypes((prev) => prev.filter((t) => t !== id));
    } else if (type === "diseaseCategory") {
      setDiseaseCategories((prev) => prev.filter((c) => c !== id));
    }
    setDeleteModal({ show: false, type: "", id: null, name: "" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterCategory("");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FiLayers className="text-3xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Items Group</h1>
        </div>
        <p className="text-gray-600">
          Manage medicine groups by type and disease category for stock management and fast selling.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openAddGroupModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <FiPlus /> Add New Group
          </button>
          <button
            onClick={() => { setShowTypeModal(true); setNewType(""); setEditingType(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <FiTag /> Manage Medicine Types
          </button>
          <button
            onClick={() => { setShowCategoryModal(true); setNewCategory(""); setEditingCategory(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <FiActivity /> Manage Disease Categories
          </button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Medicine Types</option>
            {medicineTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {/* Filter by Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Disease Categories</option>
            {diseaseCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            <FiX /> Clear Filters
          </button>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            Item Groups ({filteredGroups.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Group Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Disease Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No item groups found. Try adjusting your filters or add a new group.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{group.groupName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {group.medicineType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {group.diseaseCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{group.description || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditGroupModal(group)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDeleteGroup(group)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== ADD/EDIT GROUP MODAL ==================== */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingGroup ? "Edit Item Group" : "Add New Item Group"}
              </h3>
              <button onClick={() => setShowGroupModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGroupSubmit} className="p-6">
              <div className="space-y-4">
                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={groupForm.groupName}
                    onChange={(e) => setGroupForm({ ...groupForm, groupName: e.target.value })}
                    placeholder="Enter group name"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      groupErrors.groupName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {groupErrors.groupName && <p className="text-red-500 text-xs mt-1">{groupErrors.groupName}</p>}
                </div>
                {/* Medicine Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={groupForm.medicineType}
                    onChange={(e) => setGroupForm({ ...groupForm, medicineType: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                      groupErrors.medicineType ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select medicine type</option>
                    {medicineTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {groupErrors.medicineType && <p className="text-red-500 text-xs mt-1">{groupErrors.medicineType}</p>}
                </div>
                {/* Disease Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disease Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={groupForm.diseaseCategory}
                    onChange={(e) => setGroupForm({ ...groupForm, diseaseCategory: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                      groupErrors.diseaseCategory ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select disease category</option>
                    {diseaseCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {groupErrors.diseaseCategory && <p className="text-red-500 text-xs mt-1">{groupErrors.diseaseCategory}</p>}
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder="Enter description"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingGroup ? "Update Group" : "Save Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MANAGE MEDICINE TYPES MODAL ==================== */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiTag className="text-purple-600" /> Manage Medicine Types
              </h3>
              <button onClick={() => setShowTypeModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Add/Edit Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="Enter medicine type"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {editingType ? (
                  <button
                    onClick={handleUpdateType}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Update
                  </button>
                ) : (
                  <button
                    onClick={handleAddType}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                )}
              </div>
              {/* List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {medicineTypes.map((type) => (
                  <div key={type} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{type}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditType(type)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDeleteType(type)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MANAGE DISEASE CATEGORIES MODAL ==================== */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiActivity className="text-green-600" /> Manage Disease Categories
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Add/Edit Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter disease category"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {editingCategory ? (
                  <button
                    onClick={handleUpdateCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Update
                  </button>
                ) : (
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                )}
              </div>
              {/* List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {diseaseCategories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{cat}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDeleteCategory(cat)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Confirm Delete</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">"{deleteModal.name}"</span>?
                {deleteModal.type === "group" && " This action cannot be undone."}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, type: "", id: null, name: "" })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsGroup;
