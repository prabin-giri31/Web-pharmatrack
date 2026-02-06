import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User, UserActivity } from "../../Model/index.js";

// Helper to log activity
const logActivity = async (userId, action, description, req, metadata = {}) => {
  try {
    await UserActivity.create({
      userId,
      action,
      description,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
      metadata
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// GET /api/super-admin/users - List all users
export const getAllUsers = async (req, res) => {
  try {
    const { status, role, search, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "DESC" } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where[Op.or] = [
        { pharmacyName: { [Op.iLike]: `%${search}%` } },
        { ownerName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: [
        "id", "username", "pharmacyName", "ownerName", "email", "phone",
        "registrationNumber", "address", "role", "status", "isApproved",
        "approvedAt", "lastLoginAt", "lastLoginIp", "loginAttempts",
        "lockedUntil", "forceLogout", "createdAt", "updatedAt"
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });
    
    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// GET /api/super-admin/users/:id - Get single user details
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "passwordResetToken", "passwordResetExpires"] }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user's recent activities
    const activities = await UserActivity.findAll({
      where: { userId: id },
      order: [["createdAt", "DESC"]],
      limit: 20
    });
    
    res.status(200).json({ user, activities });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// PATCH /api/super-admin/users/:id/approve - Approve user
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user.userId;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.isApproved) {
      return res.status(400).json({ message: "User is already approved" });
    }
    
    await user.update({
      isApproved: true,
      status: "active",
      approvedBy: superAdminId,
      approvedAt: new Date()
    });
    
    await logActivity(superAdminId, "USER_APPROVED", `Approved user: ${user.email}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User approved successfully", user });
  } catch (error) {
    console.error("Approve User Error:", error);
    res.status(500).json({ message: "Failed to approve user" });
  }
};

// PATCH /api/super-admin/users/:id/reject - Reject user registration
export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const superAdminId = req.user.userId;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.isApproved) {
      return res.status(400).json({ message: "Cannot reject an already approved user" });
    }
    
    await user.destroy();
    
    await logActivity(superAdminId, "USER_REJECTED", `Rejected user registration: ${user.email}. Reason: ${reason || "Not specified"}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User registration rejected" });
  } catch (error) {
    console.error("Reject User Error:", error);
    res.status(500).json({ message: "Failed to reject user" });
  }
};

// PATCH /api/super-admin/users/:id/activate - Activate user
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user.userId;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await user.update({
      status: "active",
      lockedUntil: null,
      loginAttempts: 0,
      forceLogout: false
    });
    
    await logActivity(superAdminId, "USER_ACTIVATED", `Activated user: ${user.email}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User activated successfully", user });
  } catch (error) {
    console.error("Activate User Error:", error);
    res.status(500).json({ message: "Failed to activate user" });
  }
};

// PATCH /api/super-admin/users/:id/deactivate - Deactivate user
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user.userId;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.id === superAdminId) {
      return res.status(400).json({ message: "Cannot deactivate your own account" });
    }
    
    await user.update({
      status: "inactive",
      forceLogout: true
    });
    
    await logActivity(superAdminId, "USER_DEACTIVATED", `Deactivated user: ${user.email}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User deactivated successfully", user });
  } catch (error) {
    console.error("Deactivate User Error:", error);
    res.status(500).json({ message: "Failed to deactivate user" });
  }
};

// PATCH /api/super-admin/users/:id/lock - Lock user account
export const lockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration } = req.body; // Duration in minutes, null for permanent
    const superAdminId = req.user.userId;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.id === superAdminId) {
      return res.status(400).json({ message: "Cannot lock your own account" });
    }
    
    const lockedUntil = duration ? new Date(Date.now() + duration * 60000) : null;
    
    await user.update({
      status: "locked",
      lockedUntil,
      forceLogout: true
    });
    
    await logActivity(superAdminId, "USER_LOCKED", `Locked user: ${user.email}${duration ? ` for ${duration} minutes` : " permanently"}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User account locked", user });
  } catch (error) {
    console.error("Lock User Error:", error);
    res.status(500).json({ message: "Failed to lock user" });
  }
};

// PATCH /api/super-admin/users/:id/unlock - Unlock user account
export const unlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user.userId;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await user.update({
      status: "active",
      lockedUntil: null,
      loginAttempts: 0
    });
    
    await logActivity(superAdminId, "USER_UNLOCKED", `Unlocked user: ${user.email}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User account unlocked", user });
  } catch (error) {
    console.error("Unlock User Error:", error);
    res.status(500).json({ message: "Failed to unlock user" });
  }
};

// DELETE /api/super-admin/users/:id - Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user.userId;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.id === superAdminId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    
    if (user.role === "super_admin") {
      return res.status(400).json({ message: "Cannot delete a super admin account" });
    }
    
    const userEmail = user.email;
    await user.destroy();
    
    await logActivity(superAdminId, "USER_DELETED", `Deleted user: ${userEmail}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// PATCH /api/super-admin/users/:id/reset-password - Reset user password
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const superAdminId = req.user.userId;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await user.update({
      password: newPassword,
      forceLogout: true,
      loginAttempts: 0,
      lockedUntil: null
    });
    
    await logActivity(superAdminId, "PASSWORD_RESET", `Reset password for user: ${user.email}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// PATCH /api/super-admin/users/:id/role - Change user role
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const superAdminId = req.user.userId;
    
    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Allowed: admin, staff" });
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.id === superAdminId) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }
    
    if (user.role === "super_admin") {
      return res.status(400).json({ message: "Cannot change super admin role" });
    }
    
    const oldRole = user.role;
    await user.update({ role });
    
    await logActivity(superAdminId, "ROLE_CHANGED", `Changed role for ${user.email} from ${oldRole} to ${role}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User role updated", user });
  } catch (error) {
    console.error("Change Role Error:", error);
    res.status(500).json({ message: "Failed to change user role" });
  }
};

// POST /api/super-admin/users/:id/force-logout - Force logout user
export const forceLogoutUser = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user.userId;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.id === superAdminId) {
      return res.status(400).json({ message: "Cannot force logout yourself" });
    }
    
    await user.update({ forceLogout: true });
    
    await logActivity(superAdminId, "FORCE_LOGOUT", `Forced logout for user: ${user.email}`, req, { targetUserId: id });
    
    res.status(200).json({ message: "User will be logged out on next request" });
  } catch (error) {
    console.error("Force Logout Error:", error);
    res.status(500).json({ message: "Failed to force logout user" });
  }
};

// GET /api/super-admin/users/pending - Get pending approval users
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { status: "pending" },
          { isApproved: false }
        ]
      },
      attributes: [
        "id", "pharmacyName", "ownerName", "email", "phone",
        "registrationNumber", "address", "createdAt"
      ],
      order: [["createdAt", "DESC"]]
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Get Pending Users Error:", error);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};
