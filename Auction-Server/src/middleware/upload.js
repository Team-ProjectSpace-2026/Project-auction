import multer from "multer";
import { createRequire } from "module";
import { v2 as cloudinary } from "cloudinary";

const require = createRequire(import.meta.url);
const cloudinaryStoragePkg = require("multer-storage-cloudinary");

// Handle both v4 class constructor and v2 function export
const StorageConstructor =
  cloudinaryStoragePkg?.CloudinaryStorage ||
  (typeof cloudinaryStoragePkg === "function" ? cloudinaryStoragePkg : null) ||
  cloudinaryStoragePkg?.default ||
  cloudinaryStoragePkg;

let storage;
try {
  // Try v4 class constructor
  storage = new StorageConstructor({
    cloudinary,
    params: (req, file) => ({
      folder: req.originalUrl.includes("/tournaments")
        ? "cricauction/tournaments"
        : req.originalUrl.includes("/profile")
          ? "cricauction/profile"
          : "cricauction/players",
      allowed_formats: ["jpg", "jpeg", "png"],
      resource_type: "image",
      transformation: [{ width: 800, height: 1067, crop: "limit" }],
    }),
  });
} catch {
  // Fallback to v2 function call
  storage = StorageConstructor({
    cloudinary,
    params: (req, _file, cb) => {
      cb(null, {
        folder: req.originalUrl.includes("/tournaments")
          ? "cricauction/tournaments"
          : req.originalUrl.includes("/profile")
            ? "cricauction/profile"
            : "cricauction/players",
        allowed_formats: ["jpg", "jpeg", "png"],
        resource_type: "image",
        transformation: [{ width: 800, height: 1067, crop: "limit" }],
      });
    },
  });
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export default upload;
