import express from "express";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../Controller/Supplier/supplierController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", getSuppliers);
router.post("/", createSupplier);
router.patch("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;
