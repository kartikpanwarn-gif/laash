import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Room from "@/models/Room";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

function badId(id) {
  return !mongoose.isValidObjectId(id);
}

export async function GET(_req, { params }) {
  if (badId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await dbConnect();
  const room = await Room.findById(params.id).lean();
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ room });
}

export async function PUT(req, { params }) {
  if (badId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const room = await Room.findById(params.id);
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(room.owner) !== String(user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const fields = ["title", "description", "price", "roomType", "locality", "amenities", "gender", "images", "ownerName", "ownerPhone", "available"];
  for (const f of fields) if (f in body) room[f] = body[f];
  await room.save();
  return NextResponse.json({ room });
}

export async function DELETE(_req, { params }) {
  if (badId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const room = await Room.findById(params.id);
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(room.owner) !== String(user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await room.deleteOne();
  return NextResponse.json({ ok: true });
}
