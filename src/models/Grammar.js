import mongoose from "mongoose";

const ExampleSchema = new mongoose.Schema({
  sentence: { type: String, required: true },
  explanation: String
});

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  examples: [ExampleSchema]
});

const GrammarSchema = new mongoose.Schema({
  // classLevel removed - Grammar is now global
  topic: { type: String, required: true, unique: true }, // Ensure topic names are unique
  description: String,
  sections: [SectionSchema],
}, { timestamps: true });

export default mongoose.models.Grammar || mongoose.model("Grammar", GrammarSchema);
