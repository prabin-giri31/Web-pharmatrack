import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = (user?.role || user?.userType || "").toLowerCase();

  const [uiPrefs, setUiPrefs] = useState(() => {
    const saved = localStorage.getItem("uiSettings");
    return saved ? JSON.parse(saved) : { compactSidebar: false, showTooltips: true };
  });

  const [systemPrefs, setSystemPrefs] = useState(() => {
    const saved = localStorage.getItem("systemSettings");
    return saved ? JSON.parse(saved) : { currency: "NPR", timezone: "Asia/Kathmandu" };
  });

  useEffect(() => {
    if (role === "staff") {
      navigate("/items");
    }
  }, [role, navigate]);

  useEffect(() => {
    localStorage.setItem("uiSettings", JSON.stringify(uiPrefs));
  }, [uiPrefs]);

  useEffect(() => {
    localStorage.setItem("systemSettings", JSON.stringify(systemPrefs));
  }, [systemPrefs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage UI and system preferences</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">UI Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Compact sidebar</span>
              <input
                type="checkbox"
                checked={uiPrefs.compactSidebar}
                onChange={(e) => setUiPrefs((prev) => ({ ...prev, compactSidebar: e.target.checked }))}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Show tooltips</span>
              <input
                type="checkbox"
                checked={uiPrefs.showTooltips}
                onChange={(e) => setUiPrefs((prev) => ({ ...prev, showTooltips: e.target.checked }))}
              />
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm text-gray-700">
              Currency
              <select
                value={systemPrefs.currency}
                onChange={(e) => setSystemPrefs((prev) => ({ ...prev, currency: e.target.value }))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="NPR">NPR (Rs.)</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Timezone
              <select
                value={systemPrefs.timezone}
                onChange={(e) => setSystemPrefs((prev) => ({ ...prev, timezone: e.target.value }))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="Asia/Kathmandu">Asia/Kathmandu</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
