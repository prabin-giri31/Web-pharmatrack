import express from "express";
import {
    getAllBills,
    getBillById,
    createBill,
    updateBill,
    deleteBill,
    getBillStats,
    getOpenBillsBySupplier
} from "../../Controller/Bill/billController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Stats route (must be before :id route)
router.get("/stats", getBillStats);

// Open bills by supplier
router.get("/supplier/:supplierId/open", getOpenBillsBySupplier);

// CRUD routes
router.get("/", getAllBills);
router.get("/:id", getBillById);
router.post("/", createBill);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

export default router;
