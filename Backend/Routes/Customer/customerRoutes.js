import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from "../../Controller/Customer/customerController.js";
import asyncHandler from "../../utils/asyncHandler.js";

import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(authenticate);

// GET /api/customers/stats -> get customer statistics
router.get("/stats", asyncHandler(getCustomerStats));

// GET /api/customers -> get all customers (with optional filters)
router.get("/", asyncHandler(getCustomers));

// GET /api/customers/:id -> get single customer
router.get("/:id", asyncHandler(getCustomerById));

// POST /api/customers -> create new customer
router.post("/", asyncHandler(createCustomer));

// PATCH /api/customers/:id -> update customer
router.patch("/:id", asyncHandler(updateCustomer));

// DELETE /api/customers/:id -> delete customer
router.delete("/:id", asyncHandler(deleteCustomer));

export default router;
