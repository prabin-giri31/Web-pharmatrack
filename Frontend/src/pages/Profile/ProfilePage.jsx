import { useEffect, useMemo, useState } from "react";
import { FiCamera, FiCheckCircle, FiInfo, FiLock, FiShield, FiUser } from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { setUser } from "../../utils/auth";
import { formatDateTime } from "../../utils/formatters";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    profilePhoto: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [photoError, setPhotoError] = useState("");

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const result = await apiRequest(API_ENDPOINTS.profile);
      if (result.success) {
        setProfile(result.data);
        setFormData({
          fullName: result.data.ownerName || "",
          username: result.data.username || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          profilePhoto: result.data.profilePhoto || "",
        });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to load profile." });
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    setPhotoError("");

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setPhotoError("");

    if (!formData.fullName.trim()) {
      setMessage({ type: "error", text: "Full name is required." });
      return;
    }
    if (!formData.phone.trim()) {
      setMessage({ type: "error", text: "Phone number is required." });
      return;
    }
    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "Email address is required." });
      return;
    }

    setSaving(true);
    const payload = {
      ownerName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      username: formData.username.trim(),
      profilePhoto: formData.profilePhoto || "",
    };

    const result = await apiRequest(API_ENDPOINTS.profile, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (result.success) {
      setProfile(result.data);
      setUser(result.data);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile." });
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setPasswordSaving(true);
    const result = await apiRequest(API_ENDPOINTS.changePassword, {
      method: "PATCH",
      body: JSON.stringify({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      }),
    });

    if (result.success) {
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPasswordMessage({ type: "error", text: result.error || "Failed to update password." });
    }
    setPasswordSaving(false);
  };

  const displayName = useMemo(() => {
    if (!profile) return "User";
    return profile.ownerName || profile.pharmacyName || "User";
  }, [profile]);

  const displayRole = useMemo(() => {
    if (!profile?.role) return "Staff";
    return profile.role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">View and manage your account information</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500">{displayRole}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {message && (
          <div
            className={`text-sm rounded-lg px-4 py-3 border ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 xl:col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FiUser className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
                <p className="text-sm text-gray-500">Edit your personal account details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm text-gray-700">
                Full Name
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </label>
              <label className="text-sm text-gray-700">
                Username
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </label>
              <label className="text-sm text-gray-700">
                Email Address
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="text-xs text-gray-400">Optional update - used for login</span>
              </label>
              <label className="text-sm text-gray-700">
                Phone Number
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </label>
            </div>

            <div className="border border-dashed border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <FiCamera className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Profile Photo</div>
                    <div className="text-xs text-gray-500">Upload a square image for best results</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-sm text-blue-600 font-medium">
                    Change photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                  {formData.profilePhoto && (
                    <button
                      type="button"
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => setFormData((prev) => ({ ...prev, profilePhoto: "" }))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {photoError && <div className="text-xs text-red-600 mt-2">{photoError}</div>}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <FiInfo className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
                <p className="text-sm text-gray-500">Summary of your account status</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>User ID</span>
                <span className="font-medium text-gray-900">{profile?.id || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account Created</span>
                <span className="font-medium text-gray-900">{formatDateTime(profile?.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Login</span>
                <span className="font-medium text-gray-900">{formatDateTime(profile?.lastLoginAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account Status</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                  <FiCheckCircle />
                  {profile?.status ? profile.status : "Active"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>User Role</span>
                <span className="font-medium text-gray-900">{displayRole}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <form
            onSubmit={handlePasswordChange}
            className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <FiLock className="text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Password Management</h2>
                <p className="text-sm text-gray-500">Change your password securely</p>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`text-sm rounded-lg px-4 py-3 border ${
                  passwordMessage.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <label className="text-sm text-gray-700 block">
              Old Password
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </label>
            <label className="text-sm text-gray-700 block">
              New Password
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </label>
            <label className="text-sm text-gray-700 block">
              Confirm New Password
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </label>
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <FiShield className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Recent access details</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Last Login</span>
                <span className="font-medium text-gray-900">{formatDateTime(profile?.lastLoginAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account Created</span>
                <span className="font-medium text-gray-900">{formatDateTime(profile?.createdAt)}</span>
              </div>
              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500">
                Login history is limited to the last successful login in this version.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
