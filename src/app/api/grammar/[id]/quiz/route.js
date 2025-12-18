import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Grammar from "@/models/Grammar"; // Assuming you have this model
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req, { params }) {
  try {
    await dbConnect();

    // Await params (Next.js 15 requirement)
    const { id } = await params;

    const topic = await Grammar.findById(id);
    if (!topic) {
      return NextResponse.json({ success: false, error: "Topic not found" }, { status: 404 });
    }

    // Prepare the "Source Material"
    const context = `
      GRAMMAR TOPIC: ${topic.topic}
      CORE RULES:
      ${topic.sections.map((s, i) => `Rule ${i+1}: ${s.title} - ${s.content}`).join('\n')}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // --- IMPROVED PROMPT ---
    const prompt = `
      You are a strict English Grammar Professor creating a final exam.

      Your task is to generate 15 challenging multiple-choice questions based on the "GRAMMAR TOPIC" and "CORE RULES" provided below.

      CRITICAL INSTRUCTIONS:
      1. **DO NOT COPY EXAMPLES:** Do not use any example sentences provided in the source text. You must invent BRAND NEW sentences and scenarios.
      2. **TEST UNDERSTANDING:** Questions should test the student's ability to APPLY the rules in new contexts, not just recall definitions.
      3. **VARY DIFFICULTY:** - 5 Easy questions (Basic application).
         - 5 Medium questions (Tricky cases or exceptions).
         - 5 Hard questions (Complex sentences or common mistakes).
      4. **FORMAT:** Return ONLY a raw JSON array. No markdown, no code blocks.

      SOURCE MATERIAL:
      ${context}

      JSON STRUCTURE:
      [
        {
          "question": "The question text (e.g., 'Identify the error', 'Fill in the blank', 'Choose the correct form')",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The exact text of the correct option",
          "explanation": "A clear, educational explanation referencing the specific rule applied."
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown if present
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const quizData = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, data: quizData });

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
