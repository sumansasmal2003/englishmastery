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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

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
    // MODE 3: Generate Game Content (English Arcade)
    // ---------------------------------------------------------
    if (body.action === 'generate_game_content') {
      const { gameType, difficulty = "Medium", lastWord, history } = body;
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

      let prompt = "";

      if (gameType === 'RIDDLE') {
        prompt = `
          Generate a unique, witty riddle for a school student.
          Difficulty: ${difficulty}.
          Target Answer: A single common English noun (e.g., Candle, Shadow, Echo, Book).

          OUTPUT JSON FORMAT (No Markdown):
          {
            "question": "The riddle text here...",
            "answer": "The Answer",
            "hint": "A subtle hint"
          }
        `;
      }
      else if (gameType === 'DETECTIVE') {
        prompt = `
          Generate a "Fill in the Missing Word" context puzzle.
          Difficulty: ${difficulty}.
          The missing word should be a slightly advanced vocabulary word (e.g., Reluctant, Vivid, Fragile).

          OUTPUT JSON FORMAT (No Markdown):
          {
            "sentence": "The sentence with the word replaced by _______.",
            "answer": "TheWord",
            "meaning": "Definition of the word"
          }
        `;
      }
      else if (gameType === 'WORD_CHAIN') {
        prompt = `
          You are playing Word Chain.
          User's word: "${lastWord}".
          History: [${history.join(', ')}].

          TASK:
          1. STRICTLY VALIDATE "${lastWord}". Is it a real, standard English word found in a dictionary?
             - "yzz", "abc", "hji" are NOT valid.
             - Names like "Rahul" are NOT valid.
             - If INVALID: Return JSON with "userLost": true and "message": "That's not a real word!".

          2. IF VALID:
             - Generate a response word starting with the last letter of "${lastWord}".
             - It MUST NOT be in the history list.
             - If you cannot find a word, set "aiLost": true.

          OUTPUT JSON FORMAT (No Markdown):
          {
            "word": "YourWord",
            "userLost": boolean,
            "aiLost": boolean,
            "message": "Short comment."
          }
        `;
      }

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return NextResponse.json(JSON.parse(text));
    }

    // ---------------------------------------------------------
    // MODE 2: Generate Questions (Default)
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

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(text);

    return NextResponse.json({ questions });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
