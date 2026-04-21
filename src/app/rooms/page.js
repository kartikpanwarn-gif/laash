import { dbConnect } from "@/lib/db";
import Room, { LOCALITIES, ROOM_TYPES, GENDERS } from "@/models/Room";
import RoomCard from "@/components/RoomCard";
import RoomFilters from "@/components/RoomFilters";

export const dynamic = "force-dynamic";

export default async function RoomsPage({ searchParams }) {
  const sp = searchParams || {};
  const q = { available: true };
  if (sp.locality) q.locality = sp.locality;
  if (sp.roomType) q.roomType = sp.roomType;
  if (sp.gender) q.gender = sp.gender;
  if (sp.minPrice || sp.maxPrice) {
    q.price = {};
    if (sp.minPrice) q.price.$gte = Number(sp.minPrice);
    if (sp.maxPrice) q.price.$lte = Number(sp.maxPrice);
  }
  if (sp.q) q.$or = [
    { title: { $regex: sp.q, $options: "i" } },
    { description: { $regex: sp.q, $options: "i" } },
  ];

  let rooms = [];
  try {
    await dbConnect();
    rooms = await Room.find(q).sort({ createdAt: -1 }).limit(60).lean();
  } catch {}

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside id="filters">
        <RoomFilters
          options={{ localities: LOCALITIES, roomTypes: ROOM_TYPES, genders: GENDERS }}
          initial={sp}
        />
      </aside>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{rooms.length} rooms found</h1>
        </div>
        {rooms.length === 0 ? (
          <div className="card p-8 text-center text-gray-600">
            No rooms match your filters. Try clearing some.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((r) => (
              <RoomCard key={r._id.toString()} room={JSON.parse(JSON.stringify(r))} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
