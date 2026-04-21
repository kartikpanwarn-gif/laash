import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "BASERA — Find rooms in Srinagar Garhwal",
  description: "Discover PGs, rooms and shared accommodation in Srinagar (Garhwal).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header id="site-header" className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-white font-bold">B</span>
              <span className="text-lg font-semibold tracking-tight">BASERA</span>
              <span className="ml-1 hidden text-xs text-gray-500 sm:inline">Srinagar · Garhwal</span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link href="/rooms" className="btn-ghost">Browse</Link>
              <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
              <Link href="/login" className="btn-ghost">Login</Link>
              <Link href="/register" className="btn-primary">Sign up</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-16 border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} BASERA · Rooms for students &amp; professionals in Srinagar (Garhwal).
          </div>
        </footer>
      </body>
    </html>
  );
}
