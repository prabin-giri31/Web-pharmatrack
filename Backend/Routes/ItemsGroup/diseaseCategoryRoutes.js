// backend/Routes/ItemsGroup/diseaseCategoryRoutes.js
import express from "express";
import {
  getDiseaseCategories,
  addDiseaseCategory,
  updateDiseaseCategory,
  deleteDiseaseCategory,
  hardDeleteDiseaseCategory,
} from "../../Controller/ItemsGroup/diseaseCategoryController.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

// GET /api/disease-categories -> get all disease categories
router.get("/", asyncHandler(getDiseaseCategories));

// POST /api/disease-categories -> add new disease category
router.post("/", asyncHandler(addDiseaseCategory));

// PATCH /api/disease-categories/:id -> update disease category
router.patch("/:id", asyncHandler(updateDiseaseCategory));

// DELETE /api/disease-categories/:id -> soft delete disease category
router.delete("/:id", asyncHandler(deleteDiseaseCategory));

// DELETE /api/disease-categories/:id/permanent -> hard delete disease category
router.delete("/:id/permanent", asyncHandler(hardDeleteDiseaseCategory));

export default router;
