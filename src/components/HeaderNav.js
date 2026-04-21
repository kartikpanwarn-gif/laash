"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeaderNav() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => active && setUser(d.user))
      .catch(() => {})
      .finally(() => active && setReady(true));
    return () => { active = false; };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/";
  }

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      <Link href="/rooms" className="btn-ghost">Browse</Link>
      {user?.role === "owner" && (
        <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
      )}
      {ready && !user && (
        <>
          <Link href="/login" className="btn-ghost">Login</Link>
          <Link href="/register" className="btn-primary">Sign up</Link>
        </>
      )}
      {user && (
        <>
          <span className="hidden text-sm text-gray-600 sm:inline">Hi, {user.name?.split(" ")[0]}</span>
          <button onClick={logout} className="btn-outline" id="logout-btn">Logout</button>
        </>
      )}
    </nav>
  );
}
