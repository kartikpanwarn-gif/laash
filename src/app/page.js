import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Room, { LOCALITIES } from "@/models/Room";
import RoomCard from "@/components/RoomCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured = [];
  try {
    await dbConnect();
    featured = await Room.find({ available: true }).sort({ createdAt: -1 }).limit(6).lean();
  } catch {}

  return (
    <div className="space-y-12">
      <section id="hero" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-blue-700 p-8 text-white sm:p-12">
        <div className="max-w-2xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-blue-100">Find your next home</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            Rooms, PGs &amp; flats in Srinagar (Garhwal)
          </h1>
          <p className="mt-3 text-blue-100">
            Verified listings near HNBGU, Bus Stand, Bada Bazaar and more — connect directly with owners on WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/rooms" className="btn bg-white text-brand-dark hover:bg-blue-50">Browse rooms</Link>
            <Link href="/register" className="btn border border-white/40 text-white hover:bg-white/10">List your room</Link>
          </div>
        </div>
      </section>

      <section id="localities">
        <h2 className="mb-4 text-xl font-semibold">Popular localities</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {LOCALITIES.map((loc) => (
            <Link
              key={loc}
              href={`/rooms?locality=${encodeURIComponent(loc)}`}
              className="card flex items-center justify-center px-3 py-4 text-center text-sm font-medium hover:border-brand hover:text-brand-dark"
            >
              {loc}
            </Link>
          ))}
        </div>
      </section>

      <section id="featured">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Latest rooms</h2>
          <Link href="/rooms" className="text-sm font-medium text-brand-dark hover:underline">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <div className="card p-6 text-center text-gray-600">
            No rooms yet. Owners — <Link href="/register" className="text-brand-dark underline">sign up</Link> to add your first listing.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <RoomCard key={r._id.toString()} room={JSON.parse(JSON.stringify(r))} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
