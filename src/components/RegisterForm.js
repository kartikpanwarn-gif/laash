"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "seeker" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Sign up failed");
    router.refresh();
    router.push(form.role === "owner" ? "/dashboard" : "/rooms");
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-gray-600">Start finding (or listing) rooms in Srinagar Garhwal.</p>
      <form onSubmit={submit} className="mt-5 space-y-4" id="register-form">
        <div className="flex gap-2">
          <button type="button" onClick={() => setForm({ ...form, role: "seeker" })}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${form.role === "seeker" ? "border-brand bg-brand-light text-brand-dark" : "border-gray-300 bg-white"}`}>
            I'm looking for a room
          </button>
          <button type="button" onClick={() => setForm({ ...form, role: "owner" })}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${form.role === "owner" ? "border-brand bg-brand-light text-brand-dark" : "border-gray-300 bg-white"}`}>
            I'm an owner
          </button>
        </div>
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone (10 digit)</label>
            <input className="input" required pattern="[0-9]{10}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? "Creating…" : "Sign up"}</button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account? <Link className="text-brand-dark underline" href="/login">Login</Link>
      </p>
    </div>
  );
}
