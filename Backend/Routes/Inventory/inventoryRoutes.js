// backend/Routes/Inventory/inventoryRoutes.js
import express from "express";
import {
  getInventoryAdjustments,
  addInventoryAdjustment,
  updateInventoryAdjustment,
  deleteInventoryAdjustment,
} from "../../Controller/Inventory/inventoryController.js";
import asyncHandler from "../../utils/asyncHandler.js";

import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(authenticate);

// GET /api/inventory/adjustments -> get all adjustments
router.get("/adjustments", asyncHandler(getInventoryAdjustments));

// POST /api/inventory/adjustments -> add new adjustment
router.post("/adjustments", asyncHandler(addInventoryAdjustment));

// PUT /api/inventory/adjustments/:id -> update adjustment
router.put("/adjustments/:id", asyncHandler(updateInventoryAdjustment));

// DELETE /api/inventory/adjustments/:id -> delete adjustment
router.delete("/adjustments/:id", asyncHandler(deleteInventoryAdjustment));

export default router;
