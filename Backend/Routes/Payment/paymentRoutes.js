import express from "express";
import {
    getAllPayments,
    getPaymentById,
    createPayment,
    deletePayment,
    getPaymentStats
} from "../../Controller/Payment/paymentController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";
import { validate } from "../../Middleware/validation.middleware.js";
import { paymentSchema } from "../../Validation/schemas.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Stats route (must be before :id route)
router.get("/stats", getPaymentStats);

// CRUD routes
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.post("/", validate(paymentSchema), asyncHandler(createPayment));
router.delete("/:id", deletePayment);

export default router;
