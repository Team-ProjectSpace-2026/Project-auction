import express from "express";
import {
  register,
  login,
  getProfile,
  logout,
  refreshToken,
} from "../controllers/auth.controller.js";
import { validateRegister, validateLogin } from "../utils/validators.js";
import { handleValidationErrors } from "../middleware/errorHandler.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import auth from "../middleware/auth.middleware.js";
import { generateCaptcha, verifyCaptcha } from "../middleware/verifyCaptcha.js";

const router = express.Router();

// Captcha routes
router.post("/captcha/new", generateCaptcha);

// Public routes with captcha verification
router.post(
  "/register",
  authLimiter,
  verifyCaptcha,
  validateRegister,
  handleValidationErrors,
  register
);
router.post(
  "/login",
  authLimiter,
  verifyCaptcha,
  validateLogin,
  handleValidationErrors,
  login
);

// Protected routes
router.get("/profile", auth, getProfile);
router.post("/logout", auth, logout);
router.post("/refresh", auth, refreshToken);

export default router;
