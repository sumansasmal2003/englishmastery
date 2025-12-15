import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Grammar from '@/models/Grammar';

export async function GET() {
  try {
    await dbConnect();
    // Sort strictly by Topic Name alphabetically
    const grammar = await Grammar.find({}).sort({ topic: 1 });
    return NextResponse.json({ success: true, data: grammar });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const grammar = await Grammar.create(body);
    return NextResponse.json({ success: true, message: "Topic Created!", data: grammar }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const grammar = await Grammar.findByIdAndUpdate(_id, updateData, { new: true });

    if (!grammar) return NextResponse.json({ success: false, error: "Topic not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Topic Updated!", data: grammar }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
