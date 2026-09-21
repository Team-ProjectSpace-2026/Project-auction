import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

/**
 * Native Cloudinary Multer Storage Engine.
 * Directly streams uploads to Cloudinary v2, eliminating fragile external wrappers
 * and peer-dependency version conflicts.
 */
class CloudinaryStorageEngine {
  _handleFile(req, file, cb) {
    const folder = req.originalUrl.includes("/tournaments")
      ? "cricauction/tournaments"
      : req.originalUrl.includes("/profile")
        ? "cricauction/profile"
        : "cricauction/players";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ width: 800, height: 1067, crop: "limit" }],
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          public_id: result.public_id,
          size: result.bytes,
          format: result.format,
          url: result.secure_url,
          secure_url: result.secure_url,
        });
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    if (file && file.public_id) {
      cloudinary.uploader.destroy(file.public_id, (err) => cb(err));
    } else {
      cb(null);
    }
  }
}

const storage = new CloudinaryStorageEngine();

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
