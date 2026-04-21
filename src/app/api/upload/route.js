import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isCloudinaryConfigured, uploadDataUri } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { dataUri } = await req.json();
    if (!dataUri || !dataUri.startsWith("data:")) {
      return NextResponse.json({ error: "Provide a base64 dataUri" }, { status: 400 });
    }
    if (!isCloudinaryConfigured()) {
      // Dev fallback: return the data URI as-is so the form keeps working without cloudinary keys.
      return NextResponse.json({ url: dataUri, fallback: true });
    }
    const url = await uploadDataUri(dataUri, "basera");
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
