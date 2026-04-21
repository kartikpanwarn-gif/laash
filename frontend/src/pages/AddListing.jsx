import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { LOCALITIES, ROOM_TYPES, GENDERS, AMENITIES } from '../constants.js';

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  'Details',
  'Price & Owner',
  'Amenities',
  'Photos',
  'Review',
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEP_LABELS.map((label, idx) => {
        const step  = idx + 1;
        const done  = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  done    ? 'bg-emerald-600 border-emerald-600 text-white'
                  : active ? 'bg-white border-emerald-600 text-emerald-600'
                  : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {done ? '✓' : step}
              </div>
              <span className={`text-xs mt-1 hidden sm:block font-medium ${active ? 'text-emerald-600' : done ? 'text-emerald-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${step < current ? 'bg-emerald-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldError({ msg }) {
  return msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;
}

export default function AddListingPage() {
  return (
    <ProtectedRoute role="owner">
      <AddListing />
    </ProtectedRoute>
  );
}

function AddListing() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]       = useState(1);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    title: '',
    description: '',
    roomType: '',
    locality: '',
    gender: '',
    // Step 2
    price: '',
    ownerName: user?.name || '',
    ownerPhone: user?.phone || '',
    // Step 3
    amenities: [],
    // Step 4
    images: [],           // uploaded URLs
    pasteUrls: '',        // fallback textarea
  });

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  // --- Validation per step ---
  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.title.trim())       errs.title    = 'Title is required.';
      if (!form.roomType)           errs.roomType = 'Select a room type.';
      if (!form.locality)           errs.locality = 'Select a locality.';
      if (!form.gender)             errs.gender   = 'Select gender preference.';
    }
    if (step === 2) {
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Enter a valid price.';
      if (!form.ownerName.trim())   errs.ownerName  = 'Owner name is required.';
      if (!form.ownerPhone.trim())  errs.ownerPhone = 'Owner phone is required.';
      if (!/^\d{10}$/.test(form.ownerPhone.replace(/\s/g, ''))) errs.ownerPhone = 'Enter a valid 10-digit number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  // --- Image upload ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images[]', f));
      const { data } = await api.post('/rooms/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const urls = data.urls || data.images || [];
      set('images', [...form.images, ...urls]);
    } catch {
      alert('Image upload failed. Use the URL fallback below.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (idx) => {
    set('images', form.images.filter((_, i) => i !== idx));
  };

  // --- Final submit ---
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const pasteList = form.pasteUrls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);
      const allImages = [...form.images, ...pasteList];

      const payload = {
        title:       form.title,
        description: form.description,
        roomType:    form.roomType,
        locality:    form.locality,
        gender:      form.gender,
        price:       Number(form.price),
        ownerName:   form.ownerName,
        ownerPhone:  form.ownerPhone,
        amenities:   form.amenities,
        images:      allImages,
      };

      await api.post('/rooms', payload);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">List Your Room</h1>
      <p className="text-gray-500 text-sm mb-8">Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}</p>

      <StepIndicator current={step} />

      <div className="card p-6 sm:p-8">
        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Room Details</h2>

            <div>
              <label className="label">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="input-field"
                placeholder="e.g. Cozy single room near HNBGU Campus"
              />
              <FieldError msg={errors.title} />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="input-field resize-none"
                placeholder="Describe the room — floor, nearby landmarks, rules, etc."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Room Type *</label>
                <select value={form.roomType} onChange={(e) => set('roomType', e.target.value)} className="input-field">
                  <option value="">Select type</option>
                  {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <FieldError msg={errors.roomType} />
              </div>

              <div>
                <label className="label">Locality *</label>
                <select value={form.locality} onChange={(e) => set('locality', e.target.value)} className="input-field">
                  <option value="">Select locality</option>
                  {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <FieldError msg={errors.locality} />
              </div>

              <div>
                <label className="label">Gender Preference *</label>
                <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <FieldError msg={errors.gender} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Price & Owner */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Price &amp; Owner Info</h2>

            <div>
              <label className="label">Monthly Rent (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  className="input-field pl-7"
                  placeholder="e.g. 4000"
                  min="0"
                />
              </div>
              <FieldError msg={errors.price} />
            </div>

            <div>
              <label className="label">Owner / Contact Name *</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => set('ownerName', e.target.value)}
                className="input-field"
                placeholder="Name that seekers will see"
              />
              <FieldError msg={errors.ownerName} />
            </div>

            <div>
              <label className="label">Contact Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                  +91
                </span>
                <input
                  type="tel"
                  value={form.ownerPhone}
                  onChange={(e) => set('ownerPhone', e.target.value)}
                  className="input-field rounded-l-none"
                  placeholder="10-digit number"
                  maxLength={10}
                />
              </div>
              <FieldError msg={errors.ownerPhone} />
              <p className="text-xs text-gray-400 mt-1">Used for WhatsApp &amp; call buttons visible to seekers.</p>
            </div>
          </div>
        )}

        {/* STEP 3: Amenities */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Amenities</h2>
            <p className="text-gray-500 text-sm mb-5">Select all that apply (optional but recommended).</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITIES.map((a) => {
                const checked = form.amenities.includes(a);
                return (
                  <label
                    key={a}
                    className={`flex items-center gap-2.5 border-2 rounded-xl px-3 py-2.5 cursor-pointer text-sm transition-all ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                        : 'border-gray-200 hover:border-emerald-300 text-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(a)}
                      className="accent-emerald-600"
                    />
                    {a}
                  </label>
                );
              })}
            </div>
            {form.amenities.length > 0 && (
              <p className="text-xs text-emerald-600 mt-4">
                ✓ {form.amenities.length} amenit{form.amenities.length === 1 ? 'y' : 'ies'} selected
              </p>
            )}
          </div>
        )}

        {/* STEP 4: Photos */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Room Photos</h2>

            {/* File upload */}
            <div>
              <label className="label">Upload Images</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 rounded-xl p-8 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                <span className="text-4xl mb-2">📸</span>
                <span className="text-sm text-gray-600 font-medium">Click to upload photos</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB each</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
              </label>
              {uploadingImages && (
                <p className="text-emerald-600 text-sm mt-2 flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading…
                </p>
              )}
            </div>

            {/* Preview uploaded images */}
            {form.images.length > 0 && (
              <div>
                <label className="label">Uploaded Photos</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URL fallback */}
            <div className="border-t border-gray-100 pt-5">
              <label className="label">
                Paste Image URLs <span className="font-normal text-gray-400">(one per line, fallback)</span>
              </label>
              <textarea
                rows={4}
                value={form.pasteUrls}
                onChange={(e) => set('pasteUrls', e.target.value)}
                className="input-field resize-none font-mono text-xs"
                placeholder={"https://example.com/room1.jpg\nhttps://example.com/room2.jpg"}
              />
              <p className="text-xs text-gray-400 mt-1">Use this if Cloudinary upload isn't configured on the server.</p>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Review Your Listing</h2>
            <p className="text-gray-500 text-sm mb-4">Double-check everything before publishing.</p>

            <div className="bg-gray-50 rounded-xl divide-y divide-gray-200 border border-gray-200">
              {[
                ['Title',         form.title],
                ['Description',   form.description || '—'],
                ['Room Type',     form.roomType],
                ['Locality',      form.locality],
                ['Gender',        form.gender],
                ['Price',         form.price ? `₹${Number(form.price).toLocaleString('en-IN')}/month` : '—'],
                ['Owner Name',    form.ownerName],
                ['Owner Phone',   form.ownerPhone ? `+91 ${form.ownerPhone}` : '—'],
                ['Amenities',     form.amenities.length ? form.amenities.join(', ') : 'None selected'],
                ['Photos',        `${form.images.length + form.pasteUrls.split('\n').filter(u => u.trim()).length} image(s)`],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-3 px-4 py-3 text-sm">
                  <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
                  <span className="text-gray-800 font-medium break-all">{val}</span>
                </div>
              ))}
            </div>

            {/* Preview images */}
            {(form.images.length > 0 || form.pasteUrls.trim()) && (
              <div>
                <label className="label">Photo Preview</label>
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    ...form.images,
                    ...form.pasteUrls.split('\n').map(u => u.trim()).filter(Boolean),
                  ].map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`prev-${idx}`}
                      className="w-24 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="btn-secondary px-6 disabled:opacity-40"
          >
            ← Back
          </button>

          <span className="text-xs text-gray-400">{step} / {TOTAL_STEPS}</span>

          {step < TOTAL_STEPS ? (
            <button type="button" onClick={next} className="btn-primary px-6">
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-6"
              data-testid="submit-listing"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Publishing…
                </span>
              ) : (
                '🚀 Publish Listing'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
