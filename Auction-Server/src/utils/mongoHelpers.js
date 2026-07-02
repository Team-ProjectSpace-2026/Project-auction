import mongoose from "mongoose";

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const sanitizeObjectId = (id, fieldName = "ID") => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return new mongoose.Types.ObjectId(id);
};
