import express from "express";
import {
    getAllPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    getNextOrderNumber,
} from "../../Controller/PurchaseOrder/purchaseOrderController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";
import { validate } from "../../Middleware/validation.middleware.js";
import { purchaseOrderSchema } from "../../Validation/schemas.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get next order number
router.get("/next-number", getNextOrderNumber);

// CRUD operations
router.get("/", getAllPurchaseOrders);
router.get("/:id", getPurchaseOrderById);
router.post("/", validate(purchaseOrderSchema), createPurchaseOrder);
router.put("/:id", validate(purchaseOrderSchema), updatePurchaseOrder);
router.patch("/:id/status", updatePurchaseOrderStatus);
router.delete("/:id", deletePurchaseOrder);

export default router;
