import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TestPaper from "@/models/TestPaper";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const paper = await TestPaper.findById(id);
  if (!paper) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ paper });
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const paper = await TestPaper.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, paper });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = await params;
  await TestPaper.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
