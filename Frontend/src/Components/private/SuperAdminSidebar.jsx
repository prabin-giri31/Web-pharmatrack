import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiActivity,
  FiSettings,
  FiDatabase,
  FiX,
} from "react-icons/fi";

const SuperAdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const buildPath = (item) => {
    if (!item.path) return "";
    const query = item.query ? `?${item.query}` : "";
    const hash = item.hash ? `#${item.hash}` : "";
    return `${item.path}${query}${hash}`;
  };

  const isActiveItem = (item) => {
    if (!item.path) return false;
    if (location.pathname !== item.path) return false;
    if (item.query && location.search !== `?${item.query}`) return false;
    if (item.hash && location.hash !== `#${item.hash}`) return false;
    if (!item.query && location.search) return false;
    if (!item.hash && location.hash) return false;
    return true;
  };

  const menuItems = [
    { path: "/super-admin", label: "Dashboard", icon: FiHome },
    { path: "/super-admin/users", label: "User Management", icon: FiUsers },
    { path: "/super-admin/activities", label: "Activity Logs", icon: FiActivity },
    { path: "/super-admin/settings", label: "System Settings", icon: FiSettings },
    { path: "/super-admin/data", label: "Data Management", icon: FiDatabase },
  ];

  return (
    <aside className="w-64 h-full bg-[#1a1f2e] text-gray-100 flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-end px-4 border-b border-gray-700/50">
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
            active={isActiveItem(item)}
            onClick={() => handleNavigate(buildPath(item))}
          />
        ))}
      </nav>
    </aside>
  );
};

/* ================= COMPONENTS ================= */

const MenuItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
      active
        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
    }`}
  >
    {icon && <span className="text-lg">{icon}</span>}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default SuperAdminSidebar;
