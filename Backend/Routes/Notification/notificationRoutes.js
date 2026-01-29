import express from "express";
import { getNotifications, markAllRead, markOneRead } from "../../Controller/Notification/notificationController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", getNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markOneRead);

export default router;
