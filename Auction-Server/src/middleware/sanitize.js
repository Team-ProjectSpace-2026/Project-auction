import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
