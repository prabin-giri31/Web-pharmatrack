import express from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
} from "../../Controller/Invoice/invoiceController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../Middleware/auth.middleware.js";
import { validate } from "../../Middleware/validation.middleware.js";
import { invoiceSchema } from "../../Validation/schemas.js";

const router = express.Router();

router.use(authenticate);

router.get("/", asyncHandler(getInvoices));
router.get("/:id", asyncHandler(getInvoiceById));
router.post("/", validate(invoiceSchema), asyncHandler(createInvoice));
router.patch("/:id", asyncHandler(updateInvoice));

export default router;
