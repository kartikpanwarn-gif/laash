import Link from "next/link";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Room from "@/models/Room";
import { getCurrentUser } from "@/lib/auth";
import DashboardRow from "@/components/DashboardRow";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "owner") redirect("/rooms");

  await dbConnect();
  const rooms = await Room.find({ owner: user.id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Owner dashboard</h1>
          <p className="text-sm text-gray-600">Manage your room listings.</p>
        </div>
        <Link href="/dashboard/new" className="btn-primary" id="new-listing-btn">+ New listing</Link>
      </div>

      {rooms.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-600">You haven't listed any rooms yet.</p>
          <Link href="/dashboard/new" className="btn-primary mt-4 inline-flex">Create your first listing</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Locality</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rooms.map((r) => (
                <DashboardRow key={r._id.toString()} room={JSON.parse(JSON.stringify(r))} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
