import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Room from "@/models/Room";
import RoomCard from "@/components/RoomCard";
import RoomGallery from "@/components/RoomGallery";

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({ params }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await dbConnect();
  const room = await Room.findById(params.id).lean();
  if (!room) notFound();

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

  const phone = String(room.ownerPhone).replace(/\D/g, "");
  const waMsg = encodeURIComponent(`Hi ${room.ownerName}, I'm interested in your room "${room.title}" listed on BASERA.`);

  const r = JSON.parse(JSON.stringify(room));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/rooms" className="text-sm text-brand-dark hover:underline">← Back to listings</Link>
      </div>

      <RoomGallery images={r.images} title={r.title} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{r.title}</h1>
            <p className="mt-1 text-gray-600">{r.locality}, Srinagar (Garhwal)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge">{r.roomType}</span>
              <span className="badge">{r.gender}</span>
              <span className="badge bg-emerald-100 text-emerald-700">{r.available ? "Available" : "Not available"}</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">About this room</h2>
            <p className="mt-2 whitespace-pre-line text-gray-700">{r.description}</p>
          </div>

          {r.amenities?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {r.amenities.map((a) => (
                  <div key={a} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">✓ {a}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="card sticky top-20 h-fit space-y-4 p-5" id="contact-card">
          <div>
            <p className="text-sm text-gray-500">Monthly rent</p>
            <p className="text-3xl font-bold text-brand-dark">₹{r.price.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Owner</p>
            <p className="font-medium">{r.ownerName}</p>
            <p className="text-sm text-gray-600">+91 {phone}</p>
          </div>
          <a
            id="whatsapp-btn"
            href={`https://wa.me/91${phone}?text=${waMsg}`}
            target="_blank"
            rel="nofollow noreferrer"
            className="btn w-full bg-green-600 text-white hover:bg-green-700"
          >
            💬 WhatsApp owner
          </a>
          <a id="call-btn" href={`tel:+91${phone}`} className="btn-outline w-full">📞 Call owner</a>
          <p className="text-xs text-gray-500">Always inspect the property before paying any deposit.</p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Similar rooms</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <RoomCard key={s._id.toString()} room={JSON.parse(JSON.stringify(s))} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
