import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TestPaper from "@/models/TestPaper";

// GET: List all papers (Optionally filter by class)
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const classLevel = searchParams.get("classLevel");

  const query = classLevel ? { classLevel } : {};
  const papers = await TestPaper.find(query).sort({ createdAt: -1 }).select("title classLevel totalMarks createdAt");

  return NextResponse.json({ papers });
}

// POST: Create a new paper
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const paper = await TestPaper.create(body);
    return NextResponse.json({ success: true, paper });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
