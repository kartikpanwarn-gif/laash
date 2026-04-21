"use client";
import { useState } from "react";

export default function RoomGallery({ images = [], title }) {
  const list = images.length > 0 ? images : ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&auto=format&fit=crop"];
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
      <div className="aspect-[16/10] overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={list[active]} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="flex gap-2 sm:flex-col">
        {list.slice(0, 5).map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`aspect-square w-20 overflow-hidden rounded-md border-2 sm:w-full ${i === active ? "border-brand" : "border-transparent"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
