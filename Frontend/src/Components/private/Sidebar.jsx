import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiPackage,
  FiShoppingCart,
  FiShoppingBag,
  FiPlus,
  FiX
} from "react-icons/fi";

const Sidebar = ({ onClose }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const toggle = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 h-full bg-gray-100 text-gray-800 flex flex-col border-r border-gray-300">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 text-lg font-semibold border-b border-gray-300 bg-gray-200">
        <span>Menu</span>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-300 rounded">
            <FiX size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">

        {/* HOME */}
        <MenuItem icon={<FiHome />} label="Home" />

        {/* ITEMS */}
        <MenuToggle
          icon={<FiBox />}
          label="Items"
          open={openMenu === "items"}
          onClick={() => toggle("items")}
        />
        {openMenu === "items" && (
          <SubMenu>
            <SubItem label="Items" plus onClick={() => handleNavigate("/items")} />
            <SubItem label="Item Groups" plus onClick={() => handleNavigate("/items/groups")} />
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
            <SubItem label="Inventory Adjustments" onClick={() => handleNavigate("/inventory/adjustment")} />
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
            <SubItem label="Customers" onClick={() => handleNavigate("/sales/customers")} />
            <SubItem label="Sales Orders" onClick={() => handleNavigate("/sales/orders")} />
            <SubItem label="Invoices" onClick={() => handleNavigate("/sales/invoices")} />
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
            <SubItem label="Vendors" onClick={() => handleNavigate("/purchases/suppliers")} />
            <SubItem label="Purchase Orders" />
            <SubItem label="Purchase Receives" onClick={() => handleNavigate("/purchases/receives")} />
            <SubItem label="Bills" onClick={() => handleNavigate("/purchases/bills")} />
            <SubItem label="Payments Made" onClick={() => handleNavigate("/purchases/payments")} />
            <SubItem label="Vendor Credits" onClick={() => handleNavigate("/purchases/vendor-credits")} />
          </SubMenu>
        )}
      </nav>
    </aside>
  );
};

/* ================= COMPONENTS ================= */

const MenuItem = ({ icon, label }) => (
  <div className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-gray-200 transition">
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const MenuToggle = ({ icon, label, open, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition ${open ? "bg-gray-200" : "hover:bg-gray-200"}`}
  >
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-xs">{open ? "▾" : "▸"}</span>
  </div>
);

const SubMenu = ({ children }) => (
  <div className="ml-6 space-y-1">
    {children}
  </div>
);

const SubItem = ({ label, plus, onClick }) => (
  <div onClick={onClick} className="flex items-center justify-between px-3 py-2 rounded cursor-pointer text-sm text-gray-700 font-medium hover:bg-gray-300 transition">
    <span>{label}</span>
    {plus && <FiPlus className="w-4 h-4 opacity-80" />}
  </div>
);

export default Sidebar;
