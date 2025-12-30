import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Writing from '@/models/Writing';

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    await Writing.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Deleted Successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
