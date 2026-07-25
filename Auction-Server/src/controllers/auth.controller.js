import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { photo: req.file.path },
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
