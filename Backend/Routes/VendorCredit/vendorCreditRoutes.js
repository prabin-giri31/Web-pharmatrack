import express from "express";
import {
    getAllVendorCredits,
    getVendorCreditById,
    createVendorCredit,
    updateVendorCredit,
    deleteVendorCredit,
    applyVendorCredit,
    getVendorCreditStats,
    getAvailableCreditsBySupplier
} from "../../Controller/VendorCredit/vendorCreditController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";
import { validate } from "../../Middleware/validation.middleware.js";
import { vendorCreditSchema } from "../../Validation/schemas.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Stats route (must be before :id route)
router.get("/stats", getVendorCreditStats);

// Available credits by supplier
router.get("/supplier/:supplierId/available", getAvailableCreditsBySupplier);

// CRUD routes
router.get("/", getAllVendorCredits);
router.get("/:id", getVendorCreditById);
router.post("/", validate(vendorCreditSchema), asyncHandler(createVendorCredit));
router.put("/:id", updateVendorCredit);
router.delete("/:id", deleteVendorCredit);

// Apply credit to bill
router.post("/:id/apply", applyVendorCredit);

export default router;
