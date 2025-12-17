import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  text: { type: String },           // The Question / Statement
  options: [String],                // For MCQ or Word Box
  correctAnswer: { type: String },  // For MCQ, Fill Blanks
  isTrue: { type: Boolean },        // For True/False
  supportingStatement: { type: String }, // For T/F with support
  // For Box Matching (Pairs)
  leftItem: String,
  rightItem: String,
});

const WritingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PARAGRAPH', 'STORY', 'NOTICE', 'FAMILY_CHART', 'FORMAL_LETTER', 'INFORMAL_LETTER', 'PROCESS', 'DIARY', 'DIALOGUE'],
    required: true
  },
  question: { type: String, required: true },

  data: {
    hints: [String],
    wordLimit: String,

    // UPDATED: Added partnerId
    familyMembers: [{
        id: String,
        parentId: String,
        partnerId: String,   // Link to spouse
        name: String,
        relation: String,
        details: String
    }],

    senderAddress: String,
    receiverAddress: String,
    subject: String
  },

  modelAnswer: { type: String }
});

const ActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['MCQ', 'FILL_BLANKS', 'TRUE_FALSE', 'MATCHING', 'QA', 'WORD_BOX', 'REARRANGE', 'UNDERLINE', 'UNDERLINE_CIRCLE', 'CATEGORIZE', 'CAUSE_EFFECT'],
    required: true
  },
  instruction: { type: String, default: "Answer the following questions:" }, // Header text
  questions: [QuestionSchema]
});

const ContentBlockSchema = new mongoose.Schema({
  english: { type: String, required: true },
  bengali: { type: String, required: true },
});

const UnitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  paragraphs: [ContentBlockSchema],
  activities: [ActivitySchema],
  writings: [WritingSchema]
});

const ChapterSchema = new mongoose.Schema({
  classLevel: { type: Number, required: true },
  title: { type: String, required: true },
  author: { type: String },
  chapterNumber: Number,
  units: [UnitSchema],
}, { timestamps: true });

export default mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);
