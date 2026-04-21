"use client";
import Link from "next/link";

export default function Error({ reset }) {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-gray-600">Please try again.</p>
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={() => reset()} className="btn-primary">Retry</button>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  );
}
