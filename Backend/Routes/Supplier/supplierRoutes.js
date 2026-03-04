import express from "express";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../Controller/Supplier/supplierController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";
import { validate } from "../../Middleware/validation.middleware.js";
import { supplierSchema } from "../../Validation/schemas.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

router.use(authenticate);
router.get("/", getSuppliers);
router.post("/", validate(supplierSchema), asyncHandler(createSupplier));
router.patch("/:id", validate(supplierSchema), asyncHandler(updateSupplier));
router.delete("/:id", deleteSupplier);

export default router;
