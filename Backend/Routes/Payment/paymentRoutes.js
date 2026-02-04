import express from "express";
import {
    getAllPayments,
    getPaymentById,
    createPayment,
    deletePayment,
    getPaymentStats
} from "../../Controller/Payment/paymentController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Stats route (must be before :id route)
router.get("/stats", getPaymentStats);

// CRUD routes
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.delete("/:id", deletePayment);

export default router;
