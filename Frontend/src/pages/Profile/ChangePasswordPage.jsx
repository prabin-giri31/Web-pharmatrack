import { useState } from "react";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!oldPassword || !newPassword) {
      setMessage("Please fill all required fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    const result = await apiRequest(API_ENDPOINTS.changePassword, {
      method: "PATCH",
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (result.success) {
      setMessage("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setMessage(result.error || "Failed to update password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-500">Update your login password</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-lg">
          {message && <div className="text-sm text-blue-600">{message}</div>}
          <label className="text-sm text-gray-700 block">
            Old Password
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <label className="text-sm text-gray-700 block">
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <label className="text-sm text-gray-700 block">
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
