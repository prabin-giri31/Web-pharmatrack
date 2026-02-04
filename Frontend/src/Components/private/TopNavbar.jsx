import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { 
  FiBell, 
  FiSettings, 
  FiSearch, 
  FiUser, 
  FiLogOut, 
  FiMenu,
  FiX,
  FiChevronDown,
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiTruck,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../Images/logo.png";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { clearAuthData, getUser, getToken } from "../../utils/auth";
import { formatDate } from "../../utils/formatters";

const TopNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get user from localStorage
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // UI State
  const [openMenu, setOpenMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize user data
  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getToken();
    setUser(storedUser);
    setToken(storedToken);
  }, []);

  // Check authentication
  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  
  // Check if user is admin
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const role = (user.role || user.userType || "").toLowerCase();
    return role ? role !== "staff" : true;
  }, [user]);

  // Auth guard helper
  const ensureAuth = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return false;
    }
    return true;
  }, [isAuthenticated, navigate]);

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

  // Close menus on route change
  useEffect(() => {
    setOpenMenu(null);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setNotificationsLoading(true);
    try {
      const result = await apiRequest(API_ENDPOINTS.notifications);
      if (result.success) {
        const data = result.data || [];
        setNotifications(data);
        setUnreadCount(data.filter(n => n.unread).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Toggle menu
  const toggleMenu = useCallback((menu) => {
    setOpenMenu(prev => prev === menu ? null : menu);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    clearAuthData();
    setUser(null);
    setToken(null);
    navigate("/login");
  }, [navigate]);

  // Handle search submit
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (!ensureAuth()) return;
    
    const query = searchTerm.trim();
    if (!query) return;
    
    localStorage.setItem("globalSearch", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchTerm("");
    setMobileSearchOpen(false);
    setOpenMenu(null);
  }, [searchTerm, ensureAuth, navigate]);

  // Handle logo click
  const handleLogoClick = useCallback(() => {
    if (!ensureAuth()) return;
    navigate("/dashboard");
  }, [ensureAuth, navigate]);

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    if (!ensureAuth()) return;
    
    try {
      const result = await apiRequest(`${API_ENDPOINTS.notifications}/read-all`, { 
        method: "PATCH" 
      });
      
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, [ensureAuth]);

  // Mark single notification as read and navigate
  const handleNotificationClick = useCallback(async (notification) => {
    if (!ensureAuth()) return;
    
    if (notification.unread) {
      try {
        await apiRequest(`${API_ENDPOINTS.notifications}/${notification.id}/read`, { 
          method: "PATCH" 
        });
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, unread: false } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    
    // Navigate if link exists
    if (notification.link) {
      navigate(notification.link);
      setOpenMenu(null);
    }
  }, [ensureAuth, navigate]);

  // Quick create items
  const quickCreateItems = [
    { label: "New Sales Order", path: "/sales/orders/new", icon: FiShoppingCart },
    { label: "New Customer", path: "/sales/customers/new", icon: FiUsers },
    { label: "New Medicine", path: "/inventory/items/new", icon: FiPackage },
    { label: "New Supplier", path: "/purchases/suppliers/new", icon: FiTruck },
    { label: "New Invoice", path: "/sales/invoices/new", icon: FiFileText },
  ];

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "low_stock":
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      case "sales_order":
        return <FiShoppingCart className="w-4 h-4 text-blue-500" />;
      case "success":
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FiBell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format notification time
  const formatNotificationTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return formatDate(time);
  };

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="h-14 w-full bg-[#1f2937] text-white flex items-center px-2 sm:px-4 fixed top-0 left-0 right-0 z-50">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 mr-2 hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <FiMenu size={20} />
      </button>

      {/* Logo */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        title="Go to Dashboard"
      >
        <img
          src={logo}
          alt="PharmaTrack Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="font-semibold text-lg hidden sm:inline">PharmaTrack</span>
      </button>

      <div className="w-2 sm:w-6" />

      {/* Desktop Search */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg focus-within:ring-2 focus-within:ring-blue-500"
      >
        <FiSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search medicines, orders, customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none text-sm w-48 lg:w-64 placeholder-gray-400"
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={() => setSearchTerm("")}
            className="text-gray-400 hover:text-white"
          >
            <FiX size={14} />
          </button>
        )}
      </form>

      {/* Mobile Search Toggle */}
      <button
        className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
        onClick={() => setMobileSearchOpen(prev => !prev)}
        aria-label="Toggle search"
      >
        {mobileSearchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
      </button>

      <div className="flex-1" />

      {/* Pharmacy Name */}
      <span className="hidden lg:inline text-sm font-medium mr-3 text-gray-300">
        {user?.pharmacyName || "My Pharmacy"}
      </span>

      <span className="hidden lg:inline text-gray-500 mx-2">|</span>

      {/* Action Icons */}
      <div className="relative flex items-center gap-1 sm:gap-2" ref={menuRef}>
        {/* Quick Create Button */}
        <button
          title="Quick Create"
          onClick={() => toggleMenu("quick")}
          className="hidden sm:flex w-8 h-8 items-center justify-center
                     border-2 border-white/70 rounded-full cursor-pointer
                     hover:bg-white hover:text-gray-800 transition-all"
          aria-label="Quick create menu"
        >
          <AiOutlinePlus className="text-sm" />
        </button>

        {/* Notifications Button */}
        <button
          title="Notifications"
          onClick={() => {
            toggleMenu("notifications");
            if (openMenu !== "notifications") {
              fetchNotifications();
            }
          }}
          className="relative w-8 h-8 flex items-center justify-center
                     border-2 border-white/70 rounded-full cursor-pointer
                     hover:bg-white hover:text-gray-800 transition-all"
          aria-label="Notifications"
        >
          <FiBell className="text-sm" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Settings Button (Admin only) */}
        {isAdmin && (
          <button
            title="Settings"
            onClick={() => navigate("/settings")}
            className="hidden sm:flex w-8 h-8 items-center justify-center
                       border-2 border-white/70 rounded-full cursor-pointer
                       hover:bg-white hover:text-gray-800 transition-all"
            aria-label="Settings"
          >
            <FiSettings className="text-sm" />
          </button>
        )}

        {/* Profile Button */}
        <button
          title="Profile"
          onClick={() => toggleMenu("profile")}
          className="w-8 h-8 flex items-center justify-center
                     border-2 border-white/70 rounded-full cursor-pointer
                     hover:bg-white hover:text-gray-800 transition-all"
          aria-label="Profile menu"
        >
          <FiUser className="text-sm" />
        </button>

        {/* Logout Button */}
        <button
          title="Logout"
          onClick={handleLogout}
          className="w-8 h-8 flex items-center justify-center
                     border-2 border-white/70 rounded-full cursor-pointer
                     hover:bg-red-500 hover:border-red-500 transition-all"
          aria-label="Logout"
        >
          <FiLogOut className="text-sm" />
        </button>

        {/* Quick Create Dropdown */}
        {openMenu === "quick" && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 text-xs uppercase text-gray-500 border-b bg-gray-50 font-semibold">
              Quick Create
            </div>
            <div className="py-1">
              {quickCreateItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => {
                    navigate(item.path);
                    setOpenMenu(null);
                  }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Dropdown */}
        {openMenu === "notifications" && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <span className="text-sm font-semibold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <button 
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  onClick={markAllRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors flex gap-3 ${
                      notification.unread ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.unread ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {formatNotificationTime(notification.time)}
                      </p>
                    </div>
                    {notification.unread && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <FiBell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="border-t bg-gray-50">
                <button
                  className="w-full px-4 py-2.5 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    navigate("/notifications");
                    setOpenMenu(null);
                  }}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        )}

        {/* Profile Dropdown */}
        {openMenu === "profile" && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <FiUser className="w-6 h-6" />
              </div>
              <div className="font-semibold">{user?.ownerName || user?.pharmacyName || "User"}</div>
              <div className="text-sm text-blue-100">{user?.email || ""}</div>
              {user?.role && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 rounded text-xs capitalize">
                  {user.role}
                </span>
              )}
            </div>
            <div className="py-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  navigate("/profile");
                  setOpenMenu(null);
                }}
              >
                <FiUser className="w-4 h-4" />
                My Profile
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  navigate("/change-password");
                  setOpenMenu(null);
                }}
              >
                <FiSettings className="w-4 h-4" />
                Change Password
              </button>
              {isAdmin && (
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    navigate("/settings");
                    setOpenMenu(null);
                  }}
                >
                  <FiSettings className="w-4 h-4" />
                  Settings
                </button>
              )}
            </div>
            <div className="border-t">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                <FiLogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Panel */}
      {mobileSearchOpen && (
        <div className="fixed top-14 left-0 right-0 bg-gray-800 px-4 py-3 md:hidden z-50 border-b border-gray-700 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
            <FiSearch className="text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search medicines, orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={14} />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
