import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chapter from '@/models/Chapter';

// 1. POST: To Save a New Chapter
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const chapter = await Chapter.create(body);
    return NextResponse.json({ success: true, message: "Chapter Saved!", data: chapter }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// 2. GET: To Fetch All Chapters (Fixes the 405 Error)
export async function GET() {
  try {
    await dbConnect();
    // Fetch all chapters, sorted by class then chapter number
    const chapters = await Chapter.find({}).sort({ classLevel: 1, chapterNumber: 1 });

    return NextResponse.json({ success: true, data: chapters });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
