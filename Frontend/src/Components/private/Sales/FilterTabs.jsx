import React, { useState } from "react";
import { FiPlus, FiX, FiCheck } from "react-icons/fi";

const FilterTabs = ({ activeFilter, onFilterChange, customViews, onAddCustomView }) => {
  const [isAddingView, setIsAddingView] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const defaultFilters = [
    { id: "all", label: "All Customers" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "overdue", label: "Overdue" },
    { id: "unpaid", label: "Unpaid" },
  ];

  const allFilters = [...defaultFilters, ...customViews];

  const handleAddView = () => {
    if (newViewName.trim()) {
      onAddCustomView({
        id: `custom-${Date.now()}`,
        label: newViewName.trim(),
        isCustom: true,
      });
      setNewViewName("");
      setIsAddingView(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddView();
    } else if (e.key === "Escape") {
      setIsAddingView(false);
      setNewViewName("");
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {allFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
              ${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {filter.label}
            {filter.isCustom && (
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            )}
          </button>
        ))}

        {/* Add Custom View Button/Input */}
        {isAddingView ? (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="View name..."
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
              autoFocus
            />
            <button
              onClick={handleAddView}
              disabled={!newViewName.trim()}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiCheck size={18} />
            </button>
            <button
              onClick={() => {
                setIsAddingView(false);
                setNewViewName("");
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FiX size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingView(true)}
            className="flex items-center gap-2 px-4 py-2 ml-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap transition-all duration-200 border border-dashed border-blue-300"
          >
            <FiPlus size={16} />
            Add Custom View
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterTabs;
