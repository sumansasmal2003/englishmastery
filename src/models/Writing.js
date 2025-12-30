import mongoose from "mongoose";

const WritingSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Internal title for Admin reference
  type: {
    type: String,
    enum: ['PARAGRAPH', 'STORY', 'NOTICE', 'FAMILY_CHART', 'FORMAL_LETTER', 'INFORMAL_LETTER', 'PROCESS', 'DIARY', 'DIALOGUE', 'SUMMARY'],
    required: true
  },
  question: { type: String, required: true }, // The main prompt/question

  // Dynamic data field to store hints, limits, letter details, charts, etc.
  data: {
    hints: [String],
    wordLimit: String,
    passage: String,

    familyMembers: [{
        id: String,
        parentId: String,
        partnerId: String,
        name: String,
        relation: String,
        details: String
    }],

    characters: [String],
    setting: String,

    // Letter & Notice specific fields
    senderName: String,      // Also used for Signatory Name in Notice
    senderAddress: String,   // Also used for Organization Name in Notice
    date: String,
    receiverAddress: String,
    subject: String,         // Also used for Notice Heading
    salutation: String,      // Also used for Designation in Notice
    closing: String,
  },

  modelAnswer: { type: String } // The solution/answer
}, { timestamps: true });

export default mongoose.models.Writing || mongoose.model("Writing", WritingSchema);
