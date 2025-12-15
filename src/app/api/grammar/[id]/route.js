import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Grammar from '@/models/Grammar';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params; // Next.js 15 await fix
    const topic = await Grammar.findById(id);

    if (!topic) {
      return NextResponse.json({ success: false, error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
