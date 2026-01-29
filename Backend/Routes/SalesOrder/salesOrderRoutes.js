import express from "express";
import {
    getSalesOrders,
    getSalesOrderById,
    createSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    getSalesOrderStats,
    updateOrderStatus,
} from "../../Controller/SalesOrder/salesOrderController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(authenticate);

// GET /api/sales-orders/stats -> get sales order statistics
router.get("/stats", asyncHandler(getSalesOrderStats));

// GET /api/sales-orders -> get all sales orders (with optional filters)
router.get("/", asyncHandler(getSalesOrders));

// GET /api/sales-orders/:id -> get single sales order
router.get("/:id", asyncHandler(getSalesOrderById));

// POST /api/sales-orders -> create new sales order
router.post("/", asyncHandler(createSalesOrder));

// PATCH /api/sales-orders/:id -> update sales order
router.patch("/:id", asyncHandler(updateSalesOrder));

// PATCH /api/sales-orders/:id/status -> update order status
router.patch("/:id/status", asyncHandler(updateOrderStatus));

// DELETE /api/sales-orders/:id -> delete sales order
router.delete("/:id", asyncHandler(deleteSalesOrder));

export default router;
