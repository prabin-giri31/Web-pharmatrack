// backend/Routes/Items/itemRoute.js
import express from "express";
import { addItem, getItems, updateItem, deleteItem } from "../../Controller/Items/itemController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../Middleware/auth.middleware.js";
import { validate } from "../../Middleware/validation.middleware.js";
import { itemSchema, itemUpdateSchema } from "../../Validation/schemas.js";

const router = express.Router();

// Apply middleware to all routes
router.use(authenticate);

// POST /api/items -> add new item
router.post("/", validate(itemSchema), asyncHandler(addItem));

// GET /api/items -> get all items
router.get("/", asyncHandler(getItems));

// PATCH /api/items/:id -> update item
router.patch("/:id", validate(itemUpdateSchema), asyncHandler(updateItem));

// DELETE /api/items/:id -> delete item
router.delete("/:id", asyncHandler(deleteItem));

export default router;
