import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chapter from "@/models/Chapter";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    let { message, history } = await req.json();

    // --- FIX: Sanitize History ---
    // Gemini API throws an error if history starts with 'model'.
    // We remove any leading 'model' turns to satisfy the requirement that conversation starts with 'user'.
    if (history && history.length > 0 && history[0].role === 'model') {
      history = history.slice(1);
    }

    // 1. Fetch the Chapter Content
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return NextResponse.json({ success: false, error: "Chapter not found" }, { status: 404 });
    }

    // 2. Prepare Context (Convert structured DB data into plain text)
    // We strictly format this so the AI understands the material.
    let context = `CHAPTER TITLE: ${chapter.title}\n`;
    context += `CLASS: ${chapter.classLevel}\n\n`;

    if (chapter.units) {
      chapter.units.forEach((unit, idx) => {
        context += `UNIT ${idx + 1}: ${unit.title}\n`;

        // Add Text Content
        if (unit.paragraphs) {
          unit.paragraphs.forEach((p, pIdx) => {
            context += `[Paragraph ${pIdx + 1}] English: "${p.english}"\n`;
            if (p.bengali) context += `[Paragraph ${pIdx + 1}] Bengali Translation: "${p.bengali}"\n`;
          });
        }

        // Add Activities (So AI can help with homework)
        if (unit.activities && unit.activities.length > 0) {
          context += `\nACTIVITIES/EXERCISES:\n`;
          unit.activities.forEach((act, aIdx) => {
            context += `Activity ${aIdx + 1} (${act.type}): ${act.instruction}\n`;
            if (act.questions) {
              act.questions.forEach((q, qIdx) => {
                 // Handle diverse question structures (MCQ, Matching, etc.)
                const questionText = q.text || `${q.leftItem || ''} - ${q.rightItem || ''}`;
                context += `Q${qIdx + 1}: ${questionText}\n`;
                if (q.correctAnswer) context += `Correct Answer: ${q.correctAnswer}\n`;
              });
            }
          });
        }
      });
    }

    // 3. Initialize Gemini
    // Using gemini-2.5-flash-lite for speed and availability.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // 4. Construct the Chat Prompt
    // We send previous history to maintain conversation flow.
    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const systemInstruction = `
      You are a friendly and helpful AI Tutor for the chapter "${chapter.title}".

      STRICT RULES:
      1. Answer ONLY based on the "Source Material" provided below.
      2. If the user asks something outside this chapter (e.g., "Who is Messi?", "Write code"), politely refuse and say you can only discuss this chapter.
      3. Be encouraging. If a student asks for an answer to an exercise, give them a HINT first, don't just give the answer immediately.
      4. You can explain meanings, translations, and grammar from the text.

      SOURCE MATERIAL:
      ${context}
    `;

    // Combine system instructions with the latest user message
    const result = await chat.sendMessage(`${systemInstruction}\n\nUSER QUESTION: ${message}`);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, reply: text });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate response" }, { status: 500 });
  }
}
