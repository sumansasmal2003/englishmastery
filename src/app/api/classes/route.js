import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ClassInfo from "@/models/ClassInfo";

// 1. GET Request: Fetch all class images
export async function GET() {
  await dbConnect();
  try {
    const data = await ClassInfo.find({}).sort({ classLevel: 1 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. POST Request: Save or Update a class image
export async function POST(request) {
  await dbConnect();
  try {
    const { classLevel, coverImage } = await request.json();

    // Validate input
    if (!classLevel) {
        return NextResponse.json({ success: false, error: "Class level is required" }, { status: 400 });
    }

    // Find and update, or create if it doesn't exist (upsert)
    const updated = await ClassInfo.findOneAndUpdate(
      { classLevel },
      { coverImage },
      { new: true, upsert: true } // 'upsert' creates it if missing
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
