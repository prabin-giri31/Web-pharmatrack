import { useEffect, useRef } from "react";
import { ChevronDown, List, LayoutGrid, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ItemsHeader = ({ view, setView, filter, setFilter }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filters = [
    "All Items",
    "Active Items",
    "Inactive Items",
    "Low Stock Items",
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 bg-white border-b gap-3 sm:gap-0">
      
      {/* Left: Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-800"
        >
          {filter}
          <ChevronDown size={18} />
        </button>

        {open && (
          <div className="absolute mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
            {filters.map((item) => (
              <div
                key={item}
                onClick={() => {
                  setFilter(item);
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: View icons + New button */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
        
        {/* View toggle */}
        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`p-2 transition-colors ${
              view === "list" ? "bg-blue-100 text-blue-600" : "bg-white hover:bg-gray-100"
            }`}
            title="List View"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-2 transition-colors ${
              view === "grid" ? "bg-blue-100 text-blue-600" : "bg-white hover:bg-gray-100"
            }`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
        </div>

        {/* New button */}
        <button
          onClick={() => navigate("/items/new")}
          className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
        >
          <Plus size={18} />
          <span className="hidden xs:inline">New</span>
        </button>
      </div>
    </div>
  );
};

export default ItemsHeader;
