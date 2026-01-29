import { useEffect, useState } from "react";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    pharmacyName: "",
    ownerName: "",
    email: "",
    phone: "",
    registrationNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const result = await apiRequest(API_ENDPOINTS.profile);
      if (result.success) {
        setFormData(result.data);
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    const result = await apiRequest(API_ENDPOINTS.profile, {
      method: "PATCH",
      body: JSON.stringify(formData),
    });
    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result.data));
      setMessage("Profile updated successfully.");
    } else {
      setMessage(result.error || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Update your account details</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-2xl">
          {message && (
            <div className="text-sm text-blue-600">{message}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm text-gray-700">
              Pharmacy Name
              <input
                name="pharmacyName"
                value={formData.pharmacyName || ""}
                onChange={handleChange}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </label>
            <label className="text-sm text-gray-700">
              Owner Name
              <input
                name="ownerName"
                value={formData.ownerName || ""}
                onChange={handleChange}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </label>
            <label className="text-sm text-gray-700">
              Email
              <input
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </label>
            <label className="text-sm text-gray-700">
              Phone
              <input
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </label>
          </div>
          <label className="text-sm text-gray-700 block">
            Registration Number
            <input
              name="registrationNumber"
              value={formData.registrationNumber || ""}
              onChange={handleChange}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <label className="text-sm text-gray-700 block">
            Address
            <textarea
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              rows="3"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
