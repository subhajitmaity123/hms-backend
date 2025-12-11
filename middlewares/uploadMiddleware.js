// middlewares/upload.js
import multer from "multer";

// Use memory storage so no files are written to disk (serverless-safe)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and PDF allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single("file");

// Middleware wrapper that logs and forwards errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    // multer with .single() populates req.file (not req.files)
    const file = req.file;
    console.log("✅ Incoming file upload:", file ? file.originalname : "no-file");
    console.log("✅ Request body:", req.body);

    if (err) {
      console.error("❌ Upload Error:", err);
      // multer error types can be more specific, but 400 is reasonable for client errors
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export default uploadMiddleware;
