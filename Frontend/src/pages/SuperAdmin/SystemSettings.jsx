import { useCallback, useEffect, useState } from "react";
import {
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiLoader,
  FiAlertTriangle,
  FiCheck,
  FiDollarSign,
  FiShield,
  FiDatabase,
  FiPackage,
  FiFileText,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [changes, setChanges] = useState({});

  const categoryIcons = {
    general: FiSettings,
    invoice: FiFileText,
    sales: FiDollarSign,
    inventory: FiPackage,
    security: FiShield,
    data: FiDatabase,
  };

  const categoryLabels = {
    general: "General Settings",
    invoice: "Invoice Settings",
    sales: "Sales Settings",
    inventory: "Inventory Settings",
    security: "Security Settings",
    data: "Data Management",
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiRequest(API_ENDPOINTS.superAdmin.settings);
      if (result.success) {
        setSettings(result.data);
        setChanges({});
      } else {
        setError(result.error || "Failed to fetch settings");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (category, key, value, type) => {
    // Convert value based on type
    let convertedValue = value;
    if (type === "number") {
      convertedValue = value === "" ? "" : Number(value);
    } else if (type === "boolean") {
      convertedValue = value === "true" || value === true;
    }

    setChanges((prev) => ({
      ...prev,
      [key]: convertedValue,
    }));

    setSettings((prev) => ({
      ...prev,
      [category]: prev[category].map((s) =>
        s.key === key ? { ...s, value: convertedValue } : s
      ),
    }));
  };

  const handleSave = async () => {
    if (Object.keys(changes).length === 0) return;

    setSaving(true);
    setSuccessMessage("");
    setError(null);

    try {
      const settingsToUpdate = Object.entries(changes).map(([key, value]) => ({
        key,
        value,
      }));

      const result = await apiRequest(API_ENDPOINTS.superAdmin.settings, {
        method: "PATCH",
        body: JSON.stringify({ settings: settingsToUpdate }),
      });

      if (result.success) {
        setSuccessMessage("Settings saved successfully");
        setChanges({});
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (category = null) => {
    if (!confirm(`Reset ${category || "all"} settings to defaults?`)) return;

    try {
      setSaving(true);
      const result = await apiRequest(`${API_ENDPOINTS.superAdmin.settings}/reset`, {
        method: "POST",
        body: JSON.stringify({ category }),
      });

      if (result.success) {
        fetchSettings();
        setSuccessMessage("Settings reset to defaults");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error || "Failed to reset settings");
      }
    } catch (err) {
      setError("Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting, category) => {
    const { key, value, type, isEditable, description } = setting;

    if (!isEditable) {
      return (
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          {String(value)} (read-only)
        </div>
      );
    }

    switch (type) {
      case "boolean":
        return (
          <select
            value={String(value)}
            onChange={(e) => handleChange(category, key, e.target.value, type)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(category, key, e.target.value, type)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(category, key, e.target.value, type)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiSettings className="w-6 h-6" />
                System Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">Configure global system settings</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSettings}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={Object.keys(changes).length === 0 || saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                Save Changes
                {Object.keys(changes).length > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-500 rounded-full text-xs">
                    {Object.keys(changes).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <FiCheck className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Settings by Category */}
        {Object.entries(settings).map(([category, categorySettings]) => {
          const Icon = categoryIcons[category] || FiSettings;
          return (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {categoryLabels[category] || category}
                </h2>
                <button
                  onClick={() => handleReset(category)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset to defaults
                </button>
              </div>
              <div className="p-4 space-y-4">
                {categorySettings.map((setting) => (
                  <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {formatKey(setting.key)}
                      </label>
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      {renderSettingInput(setting, category)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(settings).length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FiSettings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No settings available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
