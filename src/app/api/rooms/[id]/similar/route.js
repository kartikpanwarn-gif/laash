import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Room from "@/models/Room";
import mongoose from "mongoose";

export async function GET(_req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ rooms: [] });
  await dbConnect();
  const room = await Room.findById(params.id).lean();
  if (!room) return NextResponse.json({ rooms: [] });
  const similar = await Room.find({
    _id: { $ne: room._id },
    available: true,
    $or: [
      { locality: room.locality },
      { roomType: room.roomType },
      { price: { $gte: room.price * 0.7, $lte: room.price * 1.3 } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
  return NextResponse.json({ rooms: similar });
}
