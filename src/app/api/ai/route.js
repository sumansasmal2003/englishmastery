import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    // ---------------------------------------------------------
    // MODE 1: Generate Unseen Passage
    // ---------------------------------------------------------
    if (body.action === 'generate_passage') {
      const { length = "200", topic = "General Knowledge" } = body;
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Write a unique reading comprehension passage for an English exam.
        Topic: ${topic}
        Approximate Word Count: ${length} words.
        Tone: Educational, engaging, and suitable for school students.
        Structure: Well-paragraphed.

        OUTPUT:
        Return ONLY the passage text. Do not include a title or introduction.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ passage: text.replace(/```/g, '').trim() });
    }

    // ---------------------------------------------------------
    // MODE 2: Generate Questions (Existing Logic)
    // ---------------------------------------------------------
    const { passage, type, marks, count = 3 } = body;

    if (!passage) {
      return NextResponse.json({ error: "No passage provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      You are an expert English teacher.
      Read the following passage:
      "${passage.substring(0, 3000)}"

      Generate ${count} distinct ${type} questions based on this passage.
      Each question must have ${marks} marks.

      OUTPUT FORMAT:
      Strictly return a RAW JSON array of objects.
      Do NOT include markdown formatting (like \`\`\`json).

      Schema per object:
      {
          "text": "The question string",
          "marks": ${marks},
          ${type === 'MCQ' ? '"options": ["Option A", "Option B", "Option C", "Option D"],' : ''}
          ${type === 'MCQ' ? '"correctAnswer": "The correct option string",' : ''}
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown if Gemini adds it
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const questions = JSON.parse(text);

    return NextResponse.json({ questions });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
