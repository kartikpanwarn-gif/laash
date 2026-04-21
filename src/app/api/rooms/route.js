import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Room from "@/models/Room";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = {};
  const locality = searchParams.get("locality");
  const roomType = searchParams.get("roomType");
  const gender = searchParams.get("gender");
  const minPrice = parseInt(searchParams.get("minPrice") || "0", 10);
  const maxPrice = parseInt(searchParams.get("maxPrice") || "0", 10);
  const search = searchParams.get("q");
  const mine = searchParams.get("mine");

  if (locality) q.locality = locality;
  if (roomType) q.roomType = roomType;
  if (gender) q.gender = gender;
  if (minPrice || maxPrice) {
    q.price = {};
    if (minPrice) q.price.$gte = minPrice;
    if (maxPrice) q.price.$lte = maxPrice;
  }
  if (search) q.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];

  if (mine === "1") {
    const user = getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    q.owner = user.id;
  } else {
    q.available = true;
  }

  const rooms = await Room.find(q).sort({ createdAt: -1 }).limit(60).lean();
  return NextResponse.json({ rooms });
}

export async function POST(req) {
  try {
    const user = getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "owner") return NextResponse.json({ error: "Only owners can list rooms" }, { status: 403 });

    const body = await req.json();
    const required = ["title", "description", "price", "roomType", "locality", "ownerName", "ownerPhone"];
    for (const k of required) if (!body[k]) return NextResponse.json({ error: `${k} is required` }, { status: 400 });

    await dbConnect();
    const room = await Room.create({
      title: body.title,
      description: body.description,
      price: Number(body.price),
      roomType: body.roomType,
      locality: body.locality,
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      gender: body.gender || "Any",
      images: Array.isArray(body.images) ? body.images : [],
      ownerName: body.ownerName,
      ownerPhone: body.ownerPhone,
      owner: user.id,
      available: body.available !== false,
    });
    return NextResponse.json({ room });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
