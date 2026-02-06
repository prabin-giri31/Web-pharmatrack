import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiUserCheck,
  FiUserX,
  FiLock,
  FiUnlock,
  FiTrash2,
  FiKey,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiEye,
  FiEdit,
} from "react-icons/fi";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import { formatDateTime } from "../../utils/formatters";

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", pagination.page);
      params.set("limit", pagination.limit);
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (roleFilter) params.set("role", roleFilter);
      
      const result = await apiRequest(`${API_ENDPOINTS.superAdmin.users}?${params.toString()}`);
      if (result.success) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleAction = async (action, userId, payload = {}) => {
    setActionLoading(userId);
    setShowActionMenu(null);
    setShowConfirmModal(null);
    
    try {
      let url = `${API_ENDPOINTS.superAdmin.users}/${userId}`;
      let method = "PATCH";
      
      switch (action) {
        case "approve":
          url += "/approve";
          break;
        case "reject":
          url += "/reject";
          method = "PATCH";
          break;
        case "activate":
          url += "/activate";
          break;
        case "deactivate":
          url += "/deactivate";
          break;
        case "lock":
          url += "/lock";
          break;
        case "unlock":
          url += "/unlock";
          break;
        case "delete":
          method = "DELETE";
          break;
        case "reset-password":
          url += "/reset-password";
          break;
        case "force-logout":
          url += "/force-logout";
          method = "POST";
          break;
        default:
          return;
      }
      
      const result = await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      });
      
      if (result.success) {
        fetchUsers();
        if (action === "reset-password") {
          setShowResetPasswordModal(false);
          setNewPassword("");
        }
      } else {
        alert(result.error || "Action failed");
      }
    } catch (err) {
      alert("Failed to perform action");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      inactive: "bg-gray-100 text-gray-700",
      locked: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.inactive}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-700",
      admin: "bg-blue-100 text-blue-700",
      staff: "bg-gray-100 text-gray-700",
    };
    const labels = {
      super_admin: "Super Admin",
      admin: "Admin",
      staff: "Staff",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || styles.staff}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiUsers className="w-6 h-6" />
                User Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage all registered users</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiFilter className="inline-block mr-2" />
              Filter
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FiAlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{user.ownerName}</p>
                              <p className="text-sm text-gray-500">{user.pharmacyName}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                          </td>
                          <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                          <td className="px-4 py-3">
                            {getStatusBadge(user.status)}
                            {!user.isApproved && user.status !== "pending" && (
                              <span className="ml-1 text-xs text-yellow-600">(Not approved)</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDateTime(user.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2 relative">
                              {/* Quick actions for pending users */}
                              {(user.status === "pending" || !user.isApproved) && (
                                <>
                                  <button
                                    onClick={() => handleAction("approve", user.id)}
                                    disabled={actionLoading === user.id}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                    title="Approve"
                                  >
                                    <FiCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setShowConfirmModal({ type: "reject", userId: user.id, userName: user.ownerName })}
                                    disabled={actionLoading === user.id}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Reject"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              {/* More actions menu */}
                              <button
                                onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                <FiMoreVertical className="w-4 h-4" />
                              </button>
                              
                              {showActionMenu === user.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => navigate(`/super-admin/users/${user.id}`)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FiEye className="w-4 h-4" /> View Details
                                    </button>
                                    
                                    {user.status === "active" && (
                                      <button
                                        onClick={() => handleAction("deactivate", user.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FiUserX className="w-4 h-4" /> Deactivate
                                      </button>
                                    )}
                                    
                                    {user.status === "inactive" && (
                                      <button
                                        onClick={() => handleAction("activate", user.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FiUserCheck className="w-4 h-4" /> Activate
                                      </button>
                                    )}
                                    
                                    {user.status === "locked" ? (
                                      <button
                                        onClick={() => handleAction("unlock", user.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FiUnlock className="w-4 h-4" /> Unlock Account
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleAction("lock", user.id, { duration: 30 })}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                      >
                                        <FiLock className="w-4 h-4" /> Lock Account
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setShowResetPasswordModal(true);
                                        setShowActionMenu(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FiKey className="w-4 h-4" /> Reset Password
                                    </button>
                                    
                                    <button
                                      onClick={() => handleAction("force-logout", user.id)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <FiLogOut className="w-4 h-4" /> Force Logout
                                    </button>
                                    
                                    {user.role !== "super_admin" && (
                                      <button
                                        onClick={() => setShowConfirmModal({ type: "delete", userId: user.id, userName: user.ownerName })}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <FiTrash2 className="w-4 h-4" /> Delete User
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              Reset password for <strong>{selectedUser.ownerName}</strong>
            </p>
            <input
              type="password"
              placeholder="New Password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setNewPassword("");
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("reset-password", selectedUser.id, { newPassword })}
                disabled={newPassword.length < 8 || actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showConfirmModal.type === "delete" ? "Delete User" : "Reject Registration"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to {showConfirmModal.type === "delete" ? "delete" : "reject"}{" "}
              <strong>{showConfirmModal.userName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(showConfirmModal.type, showConfirmModal.userId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {showConfirmModal.type === "delete" ? "Delete" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showActionMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActionMenu(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
