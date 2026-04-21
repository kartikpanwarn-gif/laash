import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, email, password, phone, role } = await req.json();
    if (!name || !email || !password || !phone)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    if (!["seeker", "owner"].includes(role))
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    await dbConnect();
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const hash = await hashPassword(password);
    const user = await User.create({ name, email: email.toLowerCase(), password: hash, phone, role });
    const token = signToken({ id: user._id.toString(), email: user.email, role: user.role, name: user.name });
    setAuthCookie(token);
    return NextResponse.json({ user: { id: user._id, name, email, role, phone } });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
