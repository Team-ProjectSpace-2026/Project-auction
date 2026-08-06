import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Reject NoSQL injection: if any body value is an object/array instead of a primitive, coerce it to string
export const noSqlInjectionGuard = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      const val = req.body[key];
      if (val !== null && typeof val === "object") {
        req.body[key] = String(val);
      }
    }
  }
  next();
};

// Strip all HTML tags and dangerous content from a string to prevent XSS
const stripHtml = (str) => {
  if (typeof str !== "string") return str;
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
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
