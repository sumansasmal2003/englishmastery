import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["MCQ", "FILL_BLANKS", "SHORT_QA", "TRUE_FALSE", "MATCHING"],
    required: true
  },
  question: String,
  options: [String],   // For MCQs
  answer: mongoose.Schema.Types.Mixed,
  matchingPairs: [{ left: String, right: String }] // For Matching
});

const ContentBlockSchema = new mongoose.Schema({
  english: { type: String, required: true },
  bengali: { type: String, required: true },
});

const UnitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  paragraphs: [ContentBlockSchema],
  activities: [ActivitySchema]
});

const ChapterSchema = new mongoose.Schema({
  classLevel: { type: Number, required: true },
  title: { type: String, required: true },
  author: { type: String },
  chapterNumber: Number,
  units: [UnitSchema],
}, { timestamps: true });

export default mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);
