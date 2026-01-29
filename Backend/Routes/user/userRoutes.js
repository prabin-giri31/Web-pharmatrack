import express from "express";
import { registerUser, loginUser, verifyToken } from "../../Controller/User/userController.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

// Register
router.post("/register", asyncHandler(registerUser));

// Login
router.post("/login", asyncHandler(loginUser));

// Verify Token
router.get("/verify-token", asyncHandler(verifyToken));

export default router;
