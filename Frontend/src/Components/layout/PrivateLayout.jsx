import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import Sidebar from "../private/Sidebar";
import TopNavbar from "../private/TopNavbar";

const PrivateLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP BAR - Fixed in component */}
      <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* BELOW TOP BAR */}
      <div className="flex pt-14">
        {/* SIDEBAR - Hidden on mobile, shown on lg+ - FIXED POSITION */}
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 overflow-y-auto z-40">
          <Sidebar />
        </div>

        {/* MOBILE SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 z-50">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* MAIN CONTENT - Pushed by Sidebar */}
        <div className="flex-1 bg-gray-50 w-full lg:ml-64 min-h-[calc(100vh-3.5rem)] overflow-x-hidden p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PrivateLayout;
