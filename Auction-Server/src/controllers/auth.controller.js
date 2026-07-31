import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/email.service.js";
import { sendSmsOtp } from "../utils/sms.service.js";

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const register = async (req, res, next) => {
  try {
    const name = String(req.body.name || "");
    const email = String(req.body.email || "").toLowerCase().trim();
    const mobile = String(req.body.mobile || "").trim();
    const password = String(req.body.password || "");

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or mobile already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      mobile,
      password,
    });

    await user.save();

    // Generate JWT token and set as httpOnly cookie
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    // Do NOT return token in response body — httpOnly cookie is sufficient
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        photo: user.photo || "",
      },
    });
  } catch (error) {
    // Handle duplicate key error for concurrent signups
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User with this email or mobile already exists",
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token and set as httpOnly cookie
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    // Do NOT return token in response body — httpOnly cookie is sufficient
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        photo: user.photo || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, mobile } = req.body;

    // Check if email or mobile is taken by another user
    if (email || mobile) {
      const query = { _id: { $ne: userId } };
      if (email) query.email = String(email).toLowerCase().trim();
      if (mobile) query.mobile = String(mobile).trim();
      const existing = await User.findOne(query);
      if (existing) {
        return res.status(400).json({ message: "Email or mobile already in use" });
      }
    }

    const updates = {};
    if (name) updates.name = String(name).trim();
    if (email) updates.email = String(email).toLowerCase().trim();
    if (mobile) updates.mobile = String(mobile).trim();

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    const photoUrl = typeof req.file.path === "string" ? req.file.path.trim() : "";
    if (!photoUrl || !/^https?:\/\//.test(photoUrl)) {
      return res.status(400).json({ message: "Invalid photo URL" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { photo: photoUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Photo updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    // Token is already validated by auth middleware and attached to req.user
    const token = generateToken(req.user.id);
    res.cookie("token", token, cookieOptions);
    res.json({ message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 1: Request Forgot Password OTP via Email
 */
export const requestForgotPasswordOtp = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200/generic message for security so users can't enumerate emails easily
      return res.json({
        message: "If an account with that email exists, an OTP has been sent.",
      });
    }

    // Generate 6-digit cryptographically secure OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = otpExpires;
    await user.save();

    // Send instant HTTP response to prevent gateway/proxy timeouts
    res.json({
      message: "Verification code sent to your email address",
      email: user.email,
    });

    // Dispatch email asynchronously in the background
    sendOtpEmail(user.email, otp, user.name || "User").catch((err) => {
      logger.error("Background OTP email dispatch failed:", err.message);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 2: Verify Forgot Password OTP
 */
export const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Generate single-use reset token valid for 15 minutes
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = resetTokenExpires;
    await user.save();

    res.json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 3: Reset Password using Reset Token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const resetToken = String(req.body.resetToken || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset session. Please try again." });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;
    await user.save();

    res.json({
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 3 (Mobile): Reset Password via verified Mobile Number (Firebase Phone Auth)
 */
export const resetPasswordByMobile = async (req, res, next) => {
  try {
    const mobile = String(req.body.mobile || "").replace(/[^0-9]/g, "").slice(-10);
    const newPassword = String(req.body.newPassword || "");

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Valid 10-digit mobile number is required" });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "No account found with this registered mobile number." });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login via Mobile Number (after Phone SMS OTP is verified)
 */
export const loginByMobile = async (req, res, next) => {
  try {
    const mobile = String(req.body.mobile || "").replace(/[^0-9]/g, "").slice(-10);
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Please provide a valid 10-digit mobile number" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "No account found with this mobile number. Please register first." });
    }

    // Generate JWT token and set cookie
    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        photo: user.photo || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send SMS OTP to domestic Indian mobile number via Fast2SMS
 */
export const sendSmsOtpHandler = async (req, res, next) => {
  try {
    const mobile = String(req.body.mobile || "").replace(/[^0-9]/g, "").slice(-10);
    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ message: "Please provide a valid 10-digit mobile number" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ mobile });
    if (user) {
      user.smsOtp = otp;
      user.smsOtpExpires = otpExpires;
      await user.save();
    }

    const smsResult = await sendSmsOtp(mobile, otp);

    if (!smsResult.success) {
      return res.status(500).json({
        message: smsResult.message || "Failed to dispatch SMS OTP. Please check your mobile number or try again.",
      });
    }

    res.json({
      message: `SMS verification code sent to +91 ${mobile}`,
      mobile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify SMS OTP Code
 */
export const verifySmsOtpHandler = async (req, res, next) => {
  try {
    const mobile = String(req.body.mobile || "").replace(/[^0-9]/g, "").slice(-10);
    const otp = String(req.body.otp || "").trim();

    if (!mobile || !otp) {
      return res.status(400).json({ message: "Mobile number and 6-digit OTP code are required" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({ message: "No registered user found with this mobile number. Please check the mobile number." });
    }

    if (!user.smsOtp || user.smsOtp !== otp || !user.smsOtpExpires || user.smsOtpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired SMS OTP code. Please try again." });
    }

    user.smsOtp = null;
    user.smsOtpExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "SMS OTP verified successfully!",
    });
  } catch (error) {
    next(error);
  }
};




