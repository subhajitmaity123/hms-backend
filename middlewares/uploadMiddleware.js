import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single("file");

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    const {file} = req.files
    console.log("✅ Incoming file upload:", file);
    console.log("✅ Request body:", req.body);
    if (err) {
      console.error("❌ Upload Error:", err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export default uploadMiddleware;
