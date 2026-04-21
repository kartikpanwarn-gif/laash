import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { LOCALITIES, ROOM_TYPES, GENDERS, AMENITIES } from '../constants.js';

export default function EditListingPage() {
  return (
    <ProtectedRoute role="owner">
      <EditListing />
    </ProtectedRoute>
  );
}

function FieldError({ msg }) {
  return msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;
}

function EditListing() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    roomType: '',
    locality: '',
    gender: '',
    price: '',
    ownerName: '',
    ownerPhone: '',
    amenities: [],
    images: [],
    pasteUrls: '',
  });

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [errors, setErrors]         = useState({});
  const [fetchError, setFetchError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get(`/rooms/${id}`)
      .then(({ data }) => {
        const r = data.room || data;
        setForm({
          title:       r.title || '',
          description: r.description || '',
          roomType:    r.roomType || '',
          locality:    r.locality || '',
          gender:      r.gender || '',
          price:       r.price?.toString() || '',
          ownerName:   r.ownerName || '',
          ownerPhone:  r.ownerPhone || '',
          amenities:   r.amenities || [],
          images:      r.images || [],
          pasteUrls:   '',
        });
      })
      .catch(() => setFetchError('Could not load listing data.'))
      .finally(() => setLoading(false));
  }, [id]);

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

  const validate = () => {
    const errs = {};
    if (!form.title.trim())                   errs.title     = 'Title is required.';
    if (!form.roomType)                        errs.roomType  = 'Select room type.';
    if (!form.locality)                        errs.locality  = 'Select locality.';
    if (!form.gender)                          errs.gender    = 'Select gender preference.';
    if (!form.price || Number(form.price) <=0) errs.price     = 'Enter a valid price.';
    if (!form.ownerName.trim())                errs.ownerName = 'Owner name is required.';
    if (!form.ownerPhone.trim())               errs.ownerPhone = 'Phone is required.';
    if (!/^\d{10}$/.test(form.ownerPhone.replace(/\s/g,''))) errs.ownerPhone = 'Enter a 10-digit number.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images[]', f));
      const { data } = await api.post('/rooms/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const urls = data.urls || data.images || [];
      set('images', [...form.images, ...urls]);
    } catch {
      alert('Image upload failed. Use the URL fallback.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => set('images', form.images.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const pasteList = form.pasteUrls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);
      const allImages = [...form.images, ...pasteList];

      await api.put(`/rooms/${id}`, {
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
      });
      setSuccessMsg('Listing updated successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="card p-6 space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="page-container text-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-medium mb-4">{fetchError}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Back"
        >
          ←
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Listing</h1>
          <p className="text-gray-500 text-sm">Update your room details below</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6" noValidate>
        {/* Basic Details */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Room Details</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} className="input-field" placeholder="Room title" />
              <FieldError msg={errors.title} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className="input-field resize-none" placeholder="Describe the room…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Room Type *</label>
                <select value={form.roomType} onChange={(e) => set('roomType', e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <FieldError msg={errors.roomType} />
              </div>
              <div>
                <label className="label">Locality *</label>
                <select value={form.locality} onChange={(e) => set('locality', e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <FieldError msg={errors.locality} />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <FieldError msg={errors.gender} />
              </div>
            </div>
          </div>
        </section>

        {/* Price & Owner */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Price &amp; Owner</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Monthly Rent (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} className="input-field pl-7" placeholder="4000" min="0" />
              </div>
              <FieldError msg={errors.price} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Owner Name *</label>
                <input type="text" value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} className="input-field" />
                <FieldError msg={errors.ownerName} />
              </div>
              <div>
                <label className="label">Owner Phone *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">+91</span>
                  <input type="tel" value={form.ownerPhone} onChange={(e) => set('ownerPhone', e.target.value)} className="input-field rounded-l-none" maxLength={10} />
                </div>
                <FieldError msg={errors.ownerPhone} />
              </div>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMENITIES.map((a) => {
              const checked = form.amenities.includes(a);
              return (
                <label
                  key={a}
                  className={`flex items-center gap-2.5 border-2 rounded-xl px-3 py-2.5 cursor-pointer text-sm transition-all ${
                    checked ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                            : 'border-gray-200 hover:border-emerald-300 text-gray-600'
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleAmenity(a)} className="accent-emerald-600" />
                  {a}
                </label>
              );
            })}
          </div>
        </section>

        {/* Photos */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Photos</h2>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 rounded-xl p-6 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all mb-4">
            <span className="text-3xl mb-1">📸</span>
            <span className="text-sm text-gray-600">Click to upload more photos</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>

          {uploading && <p className="text-emerald-600 text-sm mb-3">Uploading…</p>}

          {form.images.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="label">Add Image URLs <span className="font-normal text-gray-400">(one per line)</span></label>
            <textarea
              rows={3}
              value={form.pasteUrls}
              onChange={(e) => set('pasteUrls', e.target.value)}
              className="input-field resize-none font-mono text-xs"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1"
            data-testid="save-listing"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </span>
            ) : (
              '💾 Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
