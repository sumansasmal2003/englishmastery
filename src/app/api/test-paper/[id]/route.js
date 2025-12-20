import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import TestPaper from '@/models/TestPaper';

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    // --- FIX IS HERE ---
    // Await the params object before destructuring
    const { id } = await params;
    // -------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID format' }, { status: 400 });
    }

    const deletedPaper = await TestPaper.findByIdAndDelete(id);

    if (!deletedPaper) {
      return NextResponse.json({ success: false, error: 'Test Paper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Test Paper deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
