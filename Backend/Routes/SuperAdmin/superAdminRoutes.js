import express from "express";
import { isSuperAdmin } from "../../Middleware/superAdmin.middleware.js";
import {
  // Dashboard
  getSuperAdminDashboard,
  getSystemOverview,
  // User Management
  getAllUsers,
  getUserById,
  approveUser,
  rejectUser,
  activateUser,
  deactivateUser,
  lockUser,
  unlockUser,
  deleteUser,
  resetUserPassword,
  changeUserRole,
  forceLogoutUser,
  getPendingUsers,
  // Activity Monitoring
  getAllActivities,
  getLoginHistory,
  getSuspiciousActivities,
  getActivityStats,
  markAsSuspicious,
  clearOldActivities,
  // Settings & Data
  getSystemSettings,
  getSetting,
  updateSetting,
  bulkUpdateSettings,
  resetToDefaults,
  exportData,
  createBackup,
  getSummaryReport
} from "../../Controller/SuperAdmin/index.js";

const router = express.Router();

// All routes require Super Admin authentication
router.use(isSuperAdmin);

// ===== Dashboard Routes =====
router.get("/dashboard", getSuperAdminDashboard);
router.get("/system-overview", getSystemOverview);

// ===== User Management Routes =====
router.get("/users", getAllUsers);
router.get("/users/pending", getPendingUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/reject", rejectUser);
router.patch("/users/:id/activate", activateUser);
router.patch("/users/:id/deactivate", deactivateUser);
router.patch("/users/:id/lock", lockUser);
router.patch("/users/:id/unlock", unlockUser);
router.patch("/users/:id/reset-password", resetUserPassword);
router.patch("/users/:id/role", changeUserRole);
router.post("/users/:id/force-logout", forceLogoutUser);
router.delete("/users/:id", deleteUser);

// ===== Activity Monitoring Routes =====
router.get("/activities", getAllActivities);
router.get("/activities/login-history", getLoginHistory);
router.get("/activities/suspicious", getSuspiciousActivities);
router.get("/activities/stats", getActivityStats);
router.post("/activities/:id/mark-suspicious", markAsSuspicious);
router.delete("/activities/clear", clearOldActivities);

// ===== System Settings Routes =====
router.get("/settings", getSystemSettings);
router.get("/settings/:key", getSetting);
router.patch("/settings/:key", updateSetting);
router.patch("/settings", bulkUpdateSettings);
router.post("/settings/reset", resetToDefaults);

// ===== Data Management Routes =====
router.get("/data/export", exportData);
router.post("/data/backup", createBackup);
router.get("/reports/summary", getSummaryReport);

export default router;
