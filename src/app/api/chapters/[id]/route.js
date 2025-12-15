import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chapter from '@/models/Chapter';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    // 1. Await params (Required for Next.js 15+)
    const { id } = await params;

    // 2. Find the chapter
    const chapter = await Chapter.findById(id);

    if (!chapter) {
      return NextResponse.json({ success: false, error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: chapter });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, error: "Invalid ID format or Server Error" }, { status: 400 });
  }
}
