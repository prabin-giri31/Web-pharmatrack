import { useEffect, useMemo, useRef, useState } from "react";
import { FiBell, FiSettings, FiSearch, FiUser, FiLogOut, FiMenu } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import logo from "../../Images/logo.png";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const TopNavbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = getUser();
  const token = localStorage.getItem("token");
  const [openMenu, setOpenMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const role = (user.role || user.userType || "").toLowerCase();
    return role ? role !== "staff" : true;
  }, [user]);

  const ensureAuth = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return false;
    }
    return true;
  };

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
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch) {
      localStorage.setItem("globalSearchDraft", debouncedSearch);
    } else {
      localStorage.removeItem("globalSearchDraft");
    }
  }, [debouncedSearch]);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const handleLogout = () => {
    if (!ensureAuth()) return;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!ensureAuth()) return;
    const query = searchTerm.trim();
    if (!query) return;
    localStorage.setItem("globalSearch", query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setMobileSearchOpen(false);
  };

  const handleLogoClick = () => {
    if (!ensureAuth()) return;
    navigate("/dashboard");
    window.location.reload();
  };

  const fetchNotifications = async () => {
    if (!ensureAuth()) return;
    const result = await apiRequest(API_ENDPOINTS.notifications);
    if (result.success) {
      setNotifications(result.data || []);
    }
  };

  const markAllRead = async () => {
    if (!ensureAuth()) return;
    await apiRequest(`${API_ENDPOINTS.notifications}/read-all`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markOneRead = async (id) => {
    if (!ensureAuth()) return;
    await apiRequest(`${API_ENDPOINTS.notifications}/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <header className="h-14 w-full bg-[#1f2937] text-white flex items-center px-2 sm:px-4 fixed top-0 left-0 right-0 z-50 overflow-visible">
      {/* FiMenu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 mr-2 hover:bg-gray-700 rounded"
      >
        <FiMenu size={20} />
      </button>

      {/* Logo */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2"
        title="Dashboard"
      >
        <img
          src={logo}
          alt="PharmaTrack Logo"
          className="w-8 h-8 object-contain"
        />
        <span className="font-semibold text-lg hidden sm:inline">PharmaTrack</span>
      </button>

      <div className="w-2 sm:w-6"></div>

      {/* FiSearch */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-md"
      >
        <FiSearch className="text-sm cursor-pointer" />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent outline-none text-sm w-32 lg:w-48 placeholder-gray-300"
        />
      </form>

      <button
        className="md:hidden p-2 hover:bg-gray-700 rounded"
        onClick={() => setMobileSearchOpen((prev) => !prev)}
      >
        <FiSearch size={18} />
      </button>

      <div className="flex-1"></div>

      <span className="hidden sm:inline text-sm font-medium mr-3">
        {user?.pharmacyName || "My Store"}
      </span>

      <span className="hidden sm:inline text-gray-400 mx-2">|</span>

      {/* Icons */}
      <div className="relative flex items-center gap-2 sm:gap-4 overflow-visible" ref={menuRef}>
        {/* AiOutlinePlus - Quick Create */}
        <div
          title="Quick Create"
          onClick={() => {
            if (!ensureAuth()) return;
            toggleMenu("quick");
          }}
          className="hidden sm:flex w-7 h-7 items-center justify-center
                     border-2 border-white rounded-full cursor-pointer
                     hover:bg-white hover:text-black transition"
        >
          <AiOutlinePlus className="text-sm" />
        </div>

        {/* FiBell */}
        <div
          title="Notifications"
          onClick={() => {
            if (!ensureAuth()) return;
            fetchNotifications();
            toggleMenu("notifications");
          }}
          className="w-7 h-7 flex items-center justify-center
                     border-2 border-white rounded-full cursor-pointer
                     hover:bg-white hover:text-black transition"
        >
          <div className="relative">
            <FiBell className="text-sm" />
            {notifications.some((n) => n.unread) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        </div>

        {/* FiSettings */}
        {isAdmin && (
          <div
            title="Settings"
            onClick={() => {
              if (!ensureAuth()) return;
              navigate("/settings");
            }}
            className="hidden sm:flex w-7 h-7 items-center justify-center
                       border-2 border-white rounded-full cursor-pointer
                       hover:bg-white hover:text-black transition"
          >
            <FiSettings className="text-sm" />
          </div>
        )}

        {/* FiUser */}
        <div
          title="Profile"
          onClick={() => {
            if (!ensureAuth()) return;
            toggleMenu("profile");
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center
                     border-2 border-white rounded-full cursor-pointer
                     hover:bg-white hover:text-black transition"
        >
          <FiUser className="text-sm" />
        </div>

        {/* FiLogOut */}
        <div
          title="Logout"
          onClick={handleLogout}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center
                     border-2 border-white rounded-full cursor-pointer
                     hover:bg-red-500 hover:border-red-500 transition"
        >
          <FiLogOut className="text-sm" />
        </div>
      </div>

      {/* Mobile Search Panel */}
      {mobileSearchOpen && (
        <div className="fixed top-14 left-0 right-0 bg-gray-800 px-4 py-3 md:hidden z-50">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <FiSearch className="text-sm text-white" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-300"
            />
          </form>
        </div>
      )}

      {/* Quick Create Dropdown */}
      {openMenu === "quick" && (
        <div className="absolute right-0 top-12 w-56 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-50 overflow-visible">
          <div className="px-4 py-2 text-xs uppercase text-gray-500 border-b">Quick Create</div>
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => navigate("/sales/orders/new")}>
              New Sales Order
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => navigate("/customers/new")}>
              New Customer
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => navigate("/inventory/items/new")}>
              New Medicine
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => navigate("/purchases/suppliers/new")}>
              New Supplier
            </button>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {openMenu === "notifications" && (
        <div className="absolute right-0 top-12 w-72 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-50 overflow-visible">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm font-semibold">Notifications</span>
            <button className="text-xs text-blue-600" onClick={markAllRead}>Mark all read</button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length ? (
              notifications.map((n) => (
                <button
                  key={n.id}
                  className="w-full text-left px-4 py-2 border-b last:border-0 hover:bg-gray-50"
                  onClick={() => markOneRead(n.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${n.unread ? "font-semibold" : "text-gray-700"}`}>{n.title}</span>
                    {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                  </div>
                  <div className="text-xs text-gray-500">{n.time}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}

      {/* Profile Dropdown */}
      {openMenu === "profile" && (
        <div className="absolute right-0 top-12 w-64 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-50 overflow-visible">
          <div className="px-4 py-3 border-b">
            <div className="text-sm font-semibold">{user?.ownerName || user?.pharmacyName || "User"}</div>
            <div className="text-xs text-gray-500">{user?.email || ""}</div>
          </div>
          <div className="px-4 py-2">
            <button className="w-full text-left text-sm hover:bg-gray-100 px-2 py-1 rounded" onClick={() => navigate("/profile")}>
              My Profile
            </button>
            <button className="w-full text-left text-sm hover:bg-gray-100 px-2 py-1 rounded" onClick={() => navigate("/change-password")}>
              Change Password
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
