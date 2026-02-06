import express from "express";
import { getDashboardSummary, markNotificationRead, markAllNotificationsRead } from "../../Controller/Dashboard/dashboardController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/summary", getDashboardSummary);
router.patch("/notifications/:id/read", markNotificationRead);
router.patch("/notifications/read-all", markAllNotificationsRead);

export default router;
