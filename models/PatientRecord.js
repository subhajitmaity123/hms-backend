import mongoose from "mongoose";

const PatientRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  documents: [{ type: String }], // Array to store file paths
});

const PatientRecord = mongoose.model("PatientRecord", PatientRecordSchema);
export default PatientRecord;
