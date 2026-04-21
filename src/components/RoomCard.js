import Link from "next/link";

export default function RoomCard({ room }) {
  const img = room.images?.[0] || "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop";
  return (
    <Link
      href={`/rooms/${room._id}`}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
      data-testid="room-card"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={room.title} className="h-full w-full object-cover transition group-hover:scale-105" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{room.title}</h3>
          <span className="whitespace-nowrap font-bold text-brand-dark">₹{room.price.toLocaleString("en-IN")}</span>
        </div>
        <p className="mt-1 text-sm text-gray-600">{room.locality}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="badge">{room.roomType}</span>
          <span className="badge">{room.gender}</span>
          {room.amenities?.slice(0, 2).map((a) => (
            <span key={a} className="badge bg-gray-100 text-gray-700">{a}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
