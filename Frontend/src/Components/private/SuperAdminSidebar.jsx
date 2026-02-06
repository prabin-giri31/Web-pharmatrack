import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiActivity,
  FiSettings,
  FiDatabase,
  FiX,
  FiShield,
} from "react-icons/fi";
import logo from "../../Images/logo.png";

const SuperAdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/super-admin", label: "Dashboard", icon: FiHome },
    { path: "/super-admin/users", label: "User Management", icon: FiUsers },
    { path: "/super-admin/activities", label: "Activity Logs", icon: FiActivity },
    { path: "/super-admin/settings", label: "System Settings", icon: FiSettings },
    { path: "/super-admin/data", label: "Data Management", icon: FiDatabase },
  ];

  return (
    <aside className="w-64 h-full bg-[#1a1f2e] text-gray-100 flex flex-col">
      {/* Header with Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">Super Admin</span>
            <p className="text-[10px] text-gray-400 -mt-0.5">Control Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            icon={<item.icon />}
            label={item.label}
            active={isActive(item.path)}
            onClick={() => handleNavigate(item.path)}
          />
        ))}

        {/* Divider */}
        <div className="my-4 border-t border-gray-700/50" />

        {/* Back to Main App */}
        <MenuItem
          icon={<FiHome />}
          label="Back to Main App"
          active={false}
          onClick={() => handleNavigate("/dashboard")}
          className="text-purple-400 hover:text-purple-300"
        />
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">© 2026 PharmaTrack Admin</p>
      </div>
    </aside>
  );
};

/* ================= COMPONENTS ================= */

const MenuItem = ({ icon, label, active, onClick, className = "" }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
      active
        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
        : `text-gray-300 hover:bg-gray-700/50 hover:text-white ${className}`
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default SuperAdminSidebar;
