import express from "express";
import { getSuppliers, createSupplier } from "../../Controller/Supplier/supplierController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", getSuppliers);
router.post("/", createSupplier);

export default router;
