import express from "express";
import { register, login, verifyTokenController, listUsers, getProfile, updateProfile, changePassword } from "../Controller/auth.controller.js";
import { authenticate } from "../Middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-token", verifyTokenController);
router.get("/users", authenticate, listUsers);
router.get("/me", authenticate, getProfile);
router.patch("/me", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);

export default router;
