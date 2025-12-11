// import jwt from "jsonwebtoken";
// import ErrorHandler from "../middlewares/error.js";
// import PatientRecord from "../models/PatientRecord.js";
// import multer from "multer";
// import { User } from "../models/userSchema.js";
// import cloudinary from "cloudinary";
// // Configure Multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({ storage });

// // Get Patient Records
// export const getPatientRecords = async (req, res) => {
//   try {
//     const token = req.cookies.patientToken; 
//     if (!token) {
//       return (new ErrorHandler("User is not authenticated!", 400));
//     }
//     const decoded = jwt.verify(token, "process.env.JWT_SECRET");
//     req.user = await User.findById(decoded._id);
//     if (req.user.role !== "Patient") {
//       return (
//         new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403)
//       );
//     }
//     const record = await PatientRecord.findOne({ userId: req.user.id });
//     console.log(record);
//     if (!record) return res.status(404).json({ message: "No records found" });
//     res.json(record);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update Patient Records
// export const updatePatientRecords = async (req, res) => {
//   try {
//     const updatedRecord = await PatientRecord.findOneAndUpdate(
//       { userId: req.user.id },
//       req.body,
//       { new: true, upsert: true }
//     );
//     res.json(updatedRecord);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Upload Medical Documents
// export const uploadDocument = async (req, res) => {
//   try {
//     const { file } = req.files;
//     console.log(file);
//     const cloudinaryResponse = await cloudinary.v2.uploader.upload(
//         file.tempFilePath
//       );
//       if (!cloudinaryResponse || cloudinaryResponse.error) {
//         console.error(
//           "Cloudinary Error:",
//           cloudinaryResponse.error || "Unknown Cloudinary error"
//         );
//       }
//     // Return response with Cloudinary URL
//     res.json({
//       message: "✅ File uploaded successfully!",
//       data:cloudinaryResponse // Useful for deletion later
//     });
//     console.log(cloudinaryResponse)
//     const token = req.cookies.patientToken; 
//     if (!token) {
//       return (new ErrorHandler("User is not authenticated!", 400));
//     }
//     const decoded = jwt.verify(token, "process.env.JWT_SECRET");
//     req.user = await User.findById(decoded._id);
//     if (req.user.role !== "Patient") {
//       return (
//         new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403)
//       );
//     }
//     console.log(req.user._id);
//     const alreadyExist = await PatientRecord.findOne({userId: req.user._id});

//     if(alreadyExist)
//     {
//       const updatedRecord = await PatientRecord.findOneAndUpdate(
//         { userId: req.user._id },
//         { $push: { documents: cloudinaryResponse.secure_url } },
//         { new: true, upsert: true }
//       );
//     }else{
//       const createRecord = await PatientRecord.create({
//         userId:req.user._id,
//         documents: cloudinaryResponse.secure_url,
//       })
//     }

//   } catch (error) {
//     console.error("❌ Upload Error:", error);
//     res.status(500).json({ message: "File upload failed, try again!" });
//   }
// };

// controllers/patientController.js
import jwt from "jsonwebtoken";
import ErrorHandler from "../middlewares/error.js";
import PatientRecord from "../models/PatientRecord.js";
import multer from "multer";
import { User } from "../models/userSchema.js";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary from env
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ---------- Multer (memory storage for serverless) ----------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// promisify multer single-file middleware so you can await it
export const uploadSingleMiddleware = (fieldName = "file") =>
  (req, res) =>
    new Promise((resolve, reject) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

// ---------- Helpers ----------
const verifyPatientToken = async (req) => {
  const token = req.cookies?.patientToken;
  if (!token) throw new ErrorHandler("User is not authenticated!", 401);

  // use actual env var, not the literal string
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set in environment");

  const decoded = jwt.verify(token, secret);
  const user = await User.findById(decoded._id);
  if (!user) throw new ErrorHandler("User not found", 404);
  if (user.role !== "Patient") throw new ErrorHandler(`${user.role} not authorized for this resource!`, 403);

  return user;
};

// ---------- Controllers ----------

// Get Patient Records
export const getPatientRecords = async (req, res) => {
  try {
    const user = await verifyPatientToken(req);
    const record = await PatientRecord.findOne({ userId: user._id });
    if (!record) return res.status(404).json({ message: "No records found" });
    res.json(record);
  } catch (error) {
    // If ErrorHandler was used, it may include status code; otherwise default 500
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

// Update Patient Records
export const updatePatientRecords = async (req, res) => {
  try {
    // This route assumes authentication middleware already set req.user, otherwise call verifyPatientToken
    const user = req.user ?? (await verifyPatientToken(req));

    const updatedRecord = await PatientRecord.findOneAndUpdate(
      { userId: user._id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(updatedRecord);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

// Upload Medical Documents (file field: "file")
export const uploadDocument = async (req, res) => {
  try {
    // run multer middleware to populate req.file (memoryStorage)
    await uploadSingleMiddleware("file")(req, res);

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Upload buffer to Cloudinary using upload_stream
    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "hms_uploads" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const cloudinaryResponse = await streamUpload(req.file.buffer);

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error("Cloudinary Error:", cloudinaryResponse?.error || "Unknown Cloudinary error");
      return res.status(500).json({ message: "Upload to Cloudinary failed" });
    }

    // Auth & save to DB
    const user = await verifyPatientToken(req);

    const secureUrl = cloudinaryResponse.secure_url;

    const existing = await PatientRecord.findOne({ userId: user._id });
    let updatedRecord;
    if (existing) {
      updatedRecord = await PatientRecord.findOneAndUpdate(
        { userId: user._id },
        { $push: { documents: secureUrl } },
        { new: true }
      );
    } else {
      updatedRecord = await PatientRecord.create({
        userId: user._id,
        documents: [secureUrl],
      });
    }

    // Return response with Cloudinary URL and updated record
    res.status(200).json({
      message: "✅ File uploaded successfully!",
      url: secureUrl,
      record: updatedRecord,
      raw: cloudinaryResponse,
    });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "File upload failed, try again!" });
  }
};
