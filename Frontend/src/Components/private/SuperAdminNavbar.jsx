import { useEffect, useRef, useState, useCallback } from "react";
import {
  FiBell,
  FiUser,
  FiLogOut,
  FiMenu,
  FiChevronDown,
  FiShield,
  FiRefreshCw,
  FiAlertTriangle,
  FiHome,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { clearAuthData, getUser, getToken } from "../../utils/auth";

const SuperAdminNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);

  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getToken();
    setUser(storedUser);
    setToken(storedToken);
  }, []);

  // Fetch pending users and suspicious activities count
  const fetchAlerts = useCallback(async () => {
    try {
      const result = await apiRequest(API_ENDPOINTS.superAdmin.dashboard);
      if (result.success) {
        setPendingUsersCount(result.data?.pendingUsers || 0);
        setSuspiciousCount(result.data?.suspiciousActivities || 0);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthData();
    window.location.replace("/login");
  };

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const totalAlerts = pendingUsersCount + suspiciousCount;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-[#1a1f2e] to-[#252b3d] border-b border-gray-700/50 flex items-center justify-between px-4 z-50 shadow-lg">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-700/50 rounded-lg text-gray-300"
        >
          <FiMenu size={20} />
        </button>

        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <FiShield className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-white font-semibold">Super Admin</span>
            <span className="text-gray-400 text-xs ml-2">Control Panel</span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2" ref={menuRef}>
        {/* Refresh Button */}
        <button
          onClick={fetchAlerts}
          className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors"
          title="Refresh"
        >
          <FiRefreshCw size={18} />
        </button>

        {/* Alerts */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("alerts")}
            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors relative"
          >
            <FiBell size={18} />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalAlerts > 9 ? "9+" : totalAlerts}
              </span>
            )}
          </button>

          {openMenu === "alerts" && (
            <div className="absolute right-0 mt-2 w-72 bg-[#252b3d] rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-3 border-b border-gray-700/50">
                <h3 className="text-white font-medium">Admin Alerts</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {pendingUsersCount > 0 && (
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      navigate("/super-admin/users?status=pending");
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-700/50 text-left"
                  >
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <FiUser className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{pendingUsersCount} Pending Users</p>
                      <p className="text-gray-400 text-xs">Awaiting approval</p>
                    </div>
                  </button>
                )}
                {suspiciousCount > 0 && (
                  <button
                    onClick={() => {
                      setOpenMenu(null);
                      navigate("/super-admin/activities?tab=suspicious");
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-700/50 text-left"
                  >
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <FiAlertTriangle className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{suspiciousCount} Suspicious Activities</p>
                      <p className="text-gray-400 text-xs">Requires attention</p>
                    </div>
                  </button>
                )}
                {totalAlerts === 0 && (
                  <div className="p-4 text-center text-gray-400">
                    <p className="text-sm">No alerts</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Back to App */}
        <button
          onClick={() => navigate("/dashboard")}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-colors text-sm"
        >
          <FiHome size={14} />
          <span>Main App</span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => toggleMenu("user")}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-700/50 rounded-lg"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.ownerName?.charAt(0) || user?.email?.charAt(0) || "A"}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-white text-sm font-medium truncate max-w-[120px]">
                {user?.ownerName || user?.email || "Admin"}
              </p>
              <p className="text-purple-400 text-xs">Super Admin</p>
            </div>
            <FiChevronDown className="text-gray-400 hidden md:block" size={14} />
          </button>

          {openMenu === "user" && (
            <div className="absolute right-0 mt-2 w-48 bg-[#252b3d] rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-3 border-b border-gray-700/50">
                <p className="text-white text-sm font-medium truncate">{user?.email}</p>
                <p className="text-purple-400 text-xs">Super Admin</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    navigate("/profile");
                  }}
                  className="w-full px-4 py-2 flex items-center gap-2 text-gray-300 hover:bg-gray-700/50 hover:text-white text-sm"
                >
                  <FiUser size={14} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 flex items-center gap-2 text-red-400 hover:bg-red-500/10 text-sm"
                >
                  <FiLogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SuperAdminNavbar;
