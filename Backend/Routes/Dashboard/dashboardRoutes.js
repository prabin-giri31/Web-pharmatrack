import express from "express";
import { getDashboardSummary } from "../../Controller/Dashboard/dashboardController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/summary", getDashboardSummary);

export default router;
