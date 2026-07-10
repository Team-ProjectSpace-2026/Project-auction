import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Strip HTML tags and dangerous content from a string to prevent XSS
const stripHtml = (str) => {
  if (typeof str !== "string") return str;
  // First remove content inside dangerous tags (including their content)
  let cleaned = str.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<object[\s\S]*?<\/object>/gi, "");
  cleaned = cleaned.replace(/<embed[\s\S]*?>/gi, "");
  // Then remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  // Remove event handler attributes that might survive
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  return cleaned.trim();
};

// Deep-sanitize an object: strip HTML from all string values
export const sanitizeStrings = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "string") {
      obj[key] = stripHtml(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeStrings(obj[key]);
    }
  }
  return obj;
};

// Middleware: strip HTML tags from all req.body string fields
export const xssSanitize = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    sanitizeStrings(req.body);
  }
  next();
};

export const sanitizeIdParams = (paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];
      if (value && !isValidObjectId(value)) {
        return res.status(400).json({ message: `Invalid ${paramName} format` });
      }
      if (value) {
        req.params[paramName] = new mongoose.Types.ObjectId(value);
      }
    }
    next();
  };
};

export const sanitizeQueryIds = (queryNames) => {
  return (req, res, next) => {
    for (const queryName of queryNames) {
      const value = req.query[queryName];
      if (value && !isValidObjectId(value)) {
        return res.status(400).json({ message: `Invalid ${queryName} format` });
      }
      if (value) {
        req.query[queryName] = new mongoose.Types.ObjectId(value);
      }
    }
    next();
  };
};

export const sanitizeBodyIds = (fieldNames) => {
  return (req, res, next) => {
    for (const fieldName of fieldNames) {
      const value = req.body[fieldName];
      if (value && !isValidObjectId(value)) {
        return res.status(400).json({ message: `Invalid ${fieldName} format` });
      }
      if (value) {
        req.body[fieldName] = new mongoose.Types.ObjectId(value);
      }
    }
    next();
  };
};
