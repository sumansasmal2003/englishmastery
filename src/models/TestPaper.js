import mongoose from 'mongoose';

// 1. Define the lowest level schema first (Questions)
const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  marks: { type: Number, default: 1 },
  options: [String], // Array of strings for MCQs
  correctAnswer: String,
  explanation: String
}, { _id: false }); // _id: false prevents Mongoose from adding a unique _id to every single question sub-object

// 2. Define the Group Schema (The container for questions)
const GroupSchema = new mongoose.Schema({
  id: String,
  type: { type: String, default: 'MCQ' }, // MCQ, SAQ, etc.
  instruction: String,
  passage: String, // Optional local passage
  questions: [QuestionSchema] // Nest the QuestionSchema here
}, { _id: false });

// 3. Define the Section Schema
const SectionSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['SEEN', 'UNSEEN', 'GRAMMAR', 'WRITING'],
    default: 'SEEN'
  },
  title: String,
  contentId: String,
  customText: String,
  groups: [GroupSchema] // Nest the GroupSchema here
}, { _id: false });

// 4. The Main TestPaper Schema
const TestPaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  classLevel: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  time: { type: String, default: "45 mins" },

  scope: {
    selectedChapterIds: [String],
    // 'Mixed' is safer for complex Maps if you encounter validation issues
    selectedUnitIndices: { type: Map, of: [Number] }
  },

  sections: [SectionSchema] // Nest the SectionSchema here

}, { timestamps: true });

// 5. CRITICAL FIX for Next.js Model Caching
// If the model exists, use it. If not, create it.
// We explicitly delete the model from mongoose.models if we are in development to force a refresh on schema changes.
if (process.env.NODE_ENV === 'development') {
  if (mongoose.models.TestPaper) {
    delete mongoose.models.TestPaper;
  }
}

const TestPaper = mongoose.models.TestPaper || mongoose.model('TestPaper', TestPaperSchema);

export default TestPaper;
