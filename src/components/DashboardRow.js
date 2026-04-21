"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardRow({ room }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(`/api/rooms/${room._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !room.available }),
    });
    setBusy(false);
    router.refresh();
  }

  async function del() {
    if (!confirm(`Delete "${room.title}"?`)) return;
    setBusy(true);
    await fetch(`/api/rooms/${room._id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <Link href={`/rooms/${room._id}`} className="font-medium text-brand-dark hover:underline">{room.title}</Link>
      </td>
      <td className="px-4 py-3 text-gray-600">{room.locality}</td>
      <td className="px-4 py-3 text-gray-600">{room.roomType}</td>
      <td className="px-4 py-3 font-medium">₹{room.price.toLocaleString("en-IN")}</td>
      <td className="px-4 py-3">
        <button onClick={toggle} disabled={busy}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${room.available ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"}`}>
          {room.available ? "Available" : "Hidden"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <Link href={`/dashboard/${room._id}/edit`} className="text-sm font-medium text-brand-dark hover:underline">Edit</Link>
        <button onClick={del} disabled={busy} className="ml-3 text-sm font-medium text-red-600 hover:underline">Delete</button>
      </td>
    </tr>
  );
}
