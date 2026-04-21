"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }
  return (
    <button onClick={logout} className="btn-outline" id="logout-btn">
      Logout
    </button>
  );
}
