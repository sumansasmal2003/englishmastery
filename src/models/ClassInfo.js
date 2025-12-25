import mongoose from "mongoose";

const ClassInfoSchema = new mongoose.Schema({
  classLevel: { type: Number, required: true, unique: true },
  coverImage: { type: String },
}, { timestamps: true });

// Prevent "OverwriteModelError" in development
export default mongoose.models.ClassInfo || mongoose.model("ClassInfo", ClassInfoSchema);
