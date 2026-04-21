"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LOCALITIES = ["HNBGU Campus", "Bada Bazaar", "Parasnath Colony", "Bus Stand", "Chaura Maidan", "Gauchar Road"];
const ROOM_TYPES = ["Single", "Double", "Shared", "PG", "1BHK", "2BHK"];
const GENDERS = ["Male", "Female", "Any"];
const AMENITIES = ["WiFi", "Hot Water", "Parking", "Furnished", "Attached Bathroom", "Kitchen", "Power Backup", "Water Tank", "Balcony", "Study Table"];

const STEPS = ["Details", "Price", "Amenities", "Photos", "Review"];

export default function ListingWizard({ mode, roomId, initial, defaultOwner }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(
    initial || {
      title: "",
      description: "",
      locality: LOCALITIES[0],
      roomType: ROOM_TYPES[0],
      gender: "Any",
      price: 3000,
      amenities: [],
      images: [],
      ownerName: defaultOwner?.name || "",
      ownerPhone: defaultOwner?.phone || "",
      available: true,
    }
  );

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function validateStep() {
    if (step === 0) {
      if (!form.title.trim()) return "Title is required";
      if (form.title.length < 5) return "Title is too short";
      if (!form.description || form.description.length < 20) return "Add a description (20+ chars)";
      if (!form.locality) return "Choose a locality";
      if (!form.roomType) return "Choose a room type";
    }
    if (step === 1) {
      if (!form.price || form.price < 500) return "Enter a valid price";
      if (!form.ownerName.trim()) return "Owner name is required";
      if (!/^\d{10}$/.test(form.ownerPhone)) return "Enter a 10 digit phone";
    }
    return "";
  }

  function next() {
    const e = validateStep();
    if (e) { setError(e); return; }
    setError("");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleFiles(files) {
    const arr = Array.from(files).slice(0, 6 - form.images.length);
    for (const file of arr) {
      const dataUri = await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(file);
      });
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUri }),
      });
      const d = await r.json();
      if (d.url) setForm((f) => ({ ...f, images: [...f.images, d.url] }));
    }
  }

  function removeImage(i) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }

  async function submit() {
    const e = validateStep();
    if (e) { setError(e); return; }
    setSubmitting(true);
    setError("");
    const url = mode === "edit" ? `/api/rooms/${roomId}` : "/api/rooms";
    const method = mode === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(data.error || "Failed to save");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="card p-5" id="listing-wizard">
      {/* Stepper */}
      <ol className="mb-6 flex flex-wrap gap-2 text-xs font-medium">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-2 rounded-full px-3 py-1 ${i === step ? "bg-brand text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/30">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Single furnished room near HNBGU gate" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[120px]" value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe the room, surroundings, rules, deposit etc." />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Locality</label>
              <select className="input" value={form.locality} onChange={(e) => setField("locality", e.target.value)}>
                {LOCALITIES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Room type</label>
              <select className="input" value={form.roomType} onChange={(e) => setField("roomType", e.target.value)}>
                {ROOM_TYPES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Preferred gender</label>
              <select className="input" value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
                {GENDERS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="label">Monthly rent (₹)</label>
            <input className="input" type="number" min={500} value={form.price}
              onChange={(e) => setField("price", Number(e.target.value))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Owner name</label>
              <input className="input" value={form.ownerName} onChange={(e) => setField("ownerName", e.target.value)} />
            </div>
            <div>
              <label className="label">Owner phone (10 digit)</label>
              <input className="input" pattern="[0-9]{10}" value={form.ownerPhone}
                onChange={(e) => setField("ownerPhone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="label">Pick the amenities included</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AMENITIES.map((a) => {
              const on = form.amenities.includes(a);
              return (
                <button key={a} type="button"
                  onClick={() => setField("amenities", on ? form.amenities.filter((x) => x !== a) : [...form.amenities, a])}
                  className={`rounded-md border px-3 py-2 text-sm ${on ? "border-brand bg-brand-light text-brand-dark" : "border-gray-300 bg-white"}`}>
                  {on ? "✓ " : ""}{a}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="label">Upload up to 6 photos</label>
            <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
            <p className="mt-1 text-xs text-gray-500">If Cloudinary is not configured, images are kept inline (dev only).</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {form.images.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">✕</button>
              </div>
            ))}
            {form.images.length === 0 && (
              <div className="col-span-3 rounded-md border border-dashed p-6 text-center text-sm text-gray-500">
                No photos yet. Add at least one to make your listing stand out.
              </div>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3 text-sm">
          <h3 className="text-base font-semibold">Review your listing</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field k="Title" v={form.title} />
            <Field k="Price" v={`₹${Number(form.price).toLocaleString("en-IN")}`} />
            <Field k="Locality" v={form.locality} />
            <Field k="Type" v={form.roomType} />
            <Field k="Gender" v={form.gender} />
            <Field k="Photos" v={`${form.images.length} uploaded`} />
            <Field k="Owner" v={`${form.ownerName} (+91 ${form.ownerPhone})`} />
            <Field k="Amenities" v={form.amenities.join(", ") || "—"} />
          </div>
          <p className="rounded-md bg-amber-50 p-3 text-amber-900">By submitting, you confirm the details are accurate.</p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={back} disabled={step === 0} className="btn-outline disabled:opacity-50">Back</button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="btn-primary" id="wizard-next">Next →</button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting} className="btn-primary" id="wizard-submit">
            {submitting ? "Saving…" : mode === "edit" ? "Save changes" : "Publish listing"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ k, v }) {
  return (
    <div className="rounded-md border bg-gray-50 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-gray-500">{k}</p>
      <p className="font-medium">{v || "—"}</p>
    </div>
  );
}
