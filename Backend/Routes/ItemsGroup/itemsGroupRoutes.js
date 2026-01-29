// backend/Routes/ItemsGroup/itemsGroupRoutes.js
import express from "express";
import {
  getItemsGroups,
  getItemsGroupById,
  addItemsGroup,
  updateItemsGroup,
  deleteItemsGroup,
  hardDeleteItemsGroup,
} from "../../Controller/ItemsGroup/itemsGroupController.js";
import asyncHandler from "../../utils/asyncHandler.js";

import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(authenticate);

// GET /api/items-groups -> get all groups
router.get("/", asyncHandler(getItemsGroups));

// GET /api/items-groups/:id -> get single items group
router.get("/:id", asyncHandler(getItemsGroupById));

// POST /api/items-groups -> add new items group
router.post("/", asyncHandler(addItemsGroup));

// PATCH /api/items-groups/:id -> update items group
router.patch("/:id", asyncHandler(updateItemsGroup));

// DELETE /api/items-groups/:id -> soft delete items group
router.delete("/:id", asyncHandler(deleteItemsGroup));

// DELETE /api/items-groups/:id/permanent -> hard delete items group
router.delete("/:id/permanent", asyncHandler(hardDeleteItemsGroup));

export default router;
