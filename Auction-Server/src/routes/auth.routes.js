import express from "express";
import {
  register,
  login,
  loginByMobile,
  getProfile,
  updateProfile,
  updateProfilePhoto,
  logout,
  refreshToken,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  resetPasswordByMobile,
  sendSmsOtpHandler,
  verifySmsOtpHandler,
} from "../controllers/auth.controller.js";
import { validateRegister, validateLogin } from "../utils/validators.js";
import { handleValidationErrors } from "../middleware/errorHandler.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import auth from "../middleware/auth.middleware.js";
import { verifyCaptcha, generateCaptcha } from "../middleware/verifyCaptcha.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Fast2SMS Endpoints
router.post("/send-sms-otp", authLimiter, sendSmsOtpHandler);
router.post("/verify-sms-otp", authLimiter, verifySmsOtpHandler);

// Captcha generation
router.post("/captcha/new", authLimiter, generateCaptcha);

// Public auth routes with Creative Captcha verification
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
router.post(
  "/login-mobile",
  authLimiter,
  loginByMobile
);

// Forgot Password routes
router.post(
  "/forgot-password/request-otp",
  authLimiter,
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
router.post(
  "/forgot-password/reset-mobile",
  authLimiter,
  resetPasswordByMobile
);

// Protected routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/profile/photo", auth, upload.single("photo"), updateProfilePhoto);
router.post("/logout", auth, logout);
router.post("/refresh", auth, refreshToken);

export default router;
