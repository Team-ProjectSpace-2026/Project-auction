import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfilePhoto,
  logout,
  refreshToken,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { validateRegister, validateLogin } from "../utils/validators.js";
import { handleValidationErrors } from "../middleware/errorHandler.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import auth from "../middleware/auth.middleware.js";
import { generateCaptcha, verifyCaptcha } from "../middleware/verifyCaptcha.js";
import upload from "../middleware/upload.js";

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

// Forgot Password routes
router.post(
  "/forgot-password/request-otp",
  authLimiter,
  verifyCaptcha,
  requestForgotPasswordOtp
);
router.post(
  "/forgot-password/verify-otp",
  authLimiter,
  verifyForgotPasswordOtp
);
router.post(
  "/forgot-password/reset-password",
  authLimiter,
  resetPassword
);

// Protected routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/profile/photo", auth, upload.single("photo"), updateProfilePhoto);
router.post("/logout", auth, logout);
router.post("/refresh", auth, refreshToken);

export default router;
