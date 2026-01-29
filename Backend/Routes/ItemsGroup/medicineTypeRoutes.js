// backend/Routes/ItemsGroup/medicineTypeRoutes.js
import express from "express";
import {
  getMedicineTypes,
  addMedicineType,
  updateMedicineType,
  deleteMedicineType,
  hardDeleteMedicineType,
} from "../../Controller/ItemsGroup/medicineTypeController.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

// GET /api/medicine-types -> get all medicine types
router.get("/", asyncHandler(getMedicineTypes));

// POST /api/medicine-types -> add new medicine type
router.post("/", asyncHandler(addMedicineType));

// PATCH /api/medicine-types/:id -> update medicine type
router.patch("/:id", asyncHandler(updateMedicineType));

// DELETE /api/medicine-types/:id -> soft delete medicine type
router.delete("/:id", asyncHandler(deleteMedicineType));

// DELETE /api/medicine-types/:id/permanent -> hard delete medicine type
router.delete("/:id/permanent", asyncHandler(hardDeleteMedicineType));

export default router;
