import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiPackage,
  FiShoppingCart,
  FiShoppingBag,
  FiPlus,
  FiX,
  FiShield,
} from "react-icons/fi";
import logo from "../../Images/logo.png";

const Sidebar = ({ onClose }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setIsSuperAdmin(user.role === "super_admin");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }, []);

  const toggle = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-full bg-[#1f2937] text-gray-100 flex flex-col">
      {/* Header with Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="PharmaTrack Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <span className="text-lg font-bold text-white">PharmaTrack</span>
            <p className="text-[10px] text-gray-400 -mt-0.5">Pharmacy Management</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* DASHBOARD / HOME */}
        <MenuItem 
          icon={<FiHome />} 
          label="Dashboard" 
          active={isActive("/dashboard")}
          onClick={() => handleNavigate("/dashboard")}
        />

        {/* ITEMS */}
        <MenuToggle
          icon={<FiBox />}
          label="Items"
          open={openMenu === "items"}
          onClick={() => toggle("items")}
        />
        {openMenu === "items" && (
          <SubMenu>
            <SubItem 
              label="All Items" 
              plus 
              active={isActive("/items")}
              onClick={() => handleNavigate("/items")} 
            />
            <SubItem 
              label="Item Groups" 
              plus 
              active={isActive("/items/groups")}
              onClick={() => handleNavigate("/items/groups")} 
            />
          </SubMenu>
        )}

        {/* INVENTORY */}
        <MenuToggle
          icon={<FiPackage />}
          label="Inventory"
          open={openMenu === "inventory"}
          onClick={() => toggle("inventory")}
        />
        {openMenu === "inventory" && (
          <SubMenu>
            <SubItem 
              label="Inventory Adjustments" 
              active={isActive("/inventory/adjustment")}
              onClick={() => handleNavigate("/inventory/adjustment")} 
            />
          </SubMenu>
        )}

        {/* SALES */}
        <MenuToggle
          icon={<FiShoppingCart />}
          label="Sales"
          open={openMenu === "sales"}
          onClick={() => toggle("sales")}
        />
        {openMenu === "sales" && (
          <SubMenu>
            <SubItem 
              label="Customers" 
              active={isActive("/sales/customers")}
              onClick={() => handleNavigate("/sales/customers")} 
            />
            <SubItem 
              label="Sales Orders" 
              active={isActive("/sales/orders")}
              onClick={() => handleNavigate("/sales/orders")} 
            />
            <SubItem 
              label="Invoices" 
              active={isActive("/sales/invoices")}
              onClick={() => handleNavigate("/sales/invoices")} 
            />
          </SubMenu>
        )}

        {/* PURCHASE */}
        <MenuToggle
          icon={<FiShoppingBag />}
          label="Purchase"
          open={openMenu === "purchase"}
          onClick={() => toggle("purchase")}
        />
        {openMenu === "purchase" && (
          <SubMenu>
            <SubItem 
              label="Vendors" 
              active={isActive("/purchases/suppliers")}
              onClick={() => handleNavigate("/purchases/suppliers")} 
            />
            <SubItem label="Purchase Orders" />
            <SubItem 
              label="Purchase Receives" 
              active={isActive("/purchases/receives")}
              onClick={() => handleNavigate("/purchases/receives")} 
            />
            <SubItem 
              label="Bills" 
              active={isActive("/purchases/bills")}
              onClick={() => handleNavigate("/purchases/bills")} 
            />
            <SubItem 
              label="Payments Made" 
              active={isActive("/purchases/payments")}
              onClick={() => handleNavigate("/purchases/payments")} 
            />
            <SubItem 
              label="Vendor Credits" 
              active={isActive("/purchases/vendor-credits")}
              onClick={() => handleNavigate("/purchases/vendor-credits")} 
            />
          </SubMenu>
        )}

        {/* SUPER ADMIN - Only visible to super_admin users */}
        {isSuperAdmin && (
          <MenuItem 
            icon={<FiShield />} 
            label="Super Admin" 
            active={location.pathname.startsWith("/super-admin")}
            onClick={() => handleNavigate("/super-admin")}
          />
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">© 2026 PharmaTrack</p>
      </div>
    </aside>
  );
};

/* ================= COMPONENTS ================= */

const MenuItem = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
        : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const MenuToggle = ({ icon, label, open, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
      open ? "bg-gray-700/70 text-white" : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className={`text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
  </div>
);

const SubMenu = ({ children }) => (
  <div className="ml-4 pl-4 border-l border-gray-700/50 space-y-0.5 py-1">
    {children}
  </div>
);

const SubItem = ({ label, plus, active, onClick }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-all ${
      active 
        ? "bg-blue-600/20 text-blue-400 font-medium" 
        : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
    }`}
  >
    <span>{label}</span>
    {plus && <FiPlus className="w-4 h-4 opacity-60" />}
  </div>
);

export default Sidebar;
