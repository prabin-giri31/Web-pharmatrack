import express from "express";
import { register, login, verifyTokenController, listUsers, getProfile, updateProfile, changePassword, forgotPassword, verifyResetCode, resetPassword } from "../Controller/auth.controller.js";
import { authenticate } from "../Middleware/auth.middleware.js";
import { validate } from "../Middleware/validation.middleware.js";
import { registerSchema, loginSchema, changePasswordSchema } from "../Validation/schemas.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/verify-token", verifyTokenController);
router.get("/users", authenticate, listUsers);
router.get("/me", authenticate, getProfile);
router.patch("/me", authenticate, updateProfile);
router.patch("/change-password", authenticate, validate(changePasswordSchema), changePassword);

// Forgot password routes (no authentication required)
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
