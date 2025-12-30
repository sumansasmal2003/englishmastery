import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Writing from '@/models/Writing';

export async function GET() {
  try {
    await dbConnect();
    const writings = await Writing.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: writings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const writing = await Writing.create(body);
    return NextResponse.json({ success: true, message: "Writing Task Created!", data: writing }, { status: 201 });
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

    const writing = await Writing.findByIdAndUpdate(_id, updateData, { new: true });
    if (!writing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Updated Successfully!", data: writing });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
