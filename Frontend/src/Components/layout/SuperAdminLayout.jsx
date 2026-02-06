import { useState } from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../private/SuperAdminSidebar";
import SuperAdminNavbar from "../private/SuperAdminNavbar";

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* TOP BAR */}
      <SuperAdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* BELOW TOP BAR */}
      <div className="flex pt-14">
        {/* SIDEBAR - Hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 overflow-y-auto z-40 shadow-xl">
          <SuperAdminSidebar />
        </div>

        {/* MOBILE SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl">
              <SuperAdminSidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 w-full lg:ml-64 min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
