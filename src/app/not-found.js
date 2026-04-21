import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">Back home</Link>
    </div>
  );
}
