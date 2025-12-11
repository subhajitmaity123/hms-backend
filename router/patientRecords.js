import express from "express";
const router = express.Router();
import { getPatientRecords, updatePatientRecords, uploadDocument } from "../controller/patientRecordsController.js"; // ✅ FIXED: Added .js in the import
import { isPatientAuthenticated } from "../middlewares/auth.js"; // ✅ FIXED: Ensure auth.js is also correctly imported
import uploadMiddleware from "../middlewares/uploadMiddleware.js"; // ✅ If uploadMiddleware exists, ensure correct import

// Routes
router.get("/me", getPatientRecords);
router.post("/update", isPatientAuthenticated, updatePatientRecords);
router.post("/upload",  uploadDocument);

export default router;
