"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RoomFilters({ options, initial }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [f, setF] = useState({
    q: initial.q || "",
    locality: initial.locality || "",
    roomType: initial.roomType || "",
    gender: initial.gender || "",
    minPrice: initial.minPrice || "",
    maxPrice: initial.maxPrice || "",
  });

  function apply(e) {
    e?.preventDefault();
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => v && params.set(k, v));
    router.push(`/rooms${params.toString() ? `?${params}` : ""}`);
  }

  function clear() {
    setF({ q: "", locality: "", roomType: "", gender: "", minPrice: "", maxPrice: "" });
    router.push("/rooms");
  }

  return (
    <form onSubmit={apply} className="card sticky top-20 space-y-4 p-4" id="room-filters">
      <div>
        <label className="label">Search</label>
        <input className="input" placeholder="title, keyword…" value={f.q}
          onChange={(e) => setF({ ...f, q: e.target.value })} />
      </div>
      <div>
        <label className="label">Locality</label>
        <select className="input" value={f.locality} onChange={(e) => setF({ ...f, locality: e.target.value })}>
          <option value="">All</option>
          {options.localities.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Room type</label>
        <select className="input" value={f.roomType} onChange={(e) => setF({ ...f, roomType: e.target.value })}>
          <option value="">All</option>
          {options.roomTypes.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Gender</label>
        <select className="input" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}>
          <option value="">Any</option>
          {options.genders.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Min ₹</label>
          <input className="input" type="number" min={0} value={f.minPrice}
            onChange={(e) => setF({ ...f, minPrice: e.target.value })} />
        </div>
        <div>
          <label className="label">Max ₹</label>
          <input className="input" type="number" min={0} value={f.maxPrice}
            onChange={(e) => setF({ ...f, maxPrice: e.target.value })} />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary flex-1" type="submit">Apply</button>
        <button className="btn-outline" type="button" onClick={clear}>Clear</button>
      </div>
    </form>
  );
}
