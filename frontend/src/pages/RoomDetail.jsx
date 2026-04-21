import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import RoomCard from '../components/RoomCard.jsx';
import { GENDER_COLORS, ROOM_TYPE_COLORS } from '../constants.js';

const PLACEHOLDER = 'https://placehold.co/800x500/d1fae5/047857?text=BASERA';

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom]           = useState(null);
  const [similar, setSimilar]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    setActiveImg(0);

    api.get(`/rooms/${id}`)
      .then(({ data }) => {
        setRoom(data.room || data);
        return api.get(`/rooms/${id}/similar`);
      })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.rooms || []);
        setSimilar(list.slice(0, 4));
      })
      .catch(() => setError('Could not load room details. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-80 bg-gray-200 rounded-xl" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="page-container text-center py-20">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-medium mb-4">{error || 'Room not found.'}</p>
        <Link to="/listings" className="btn-primary">← Back to Listings</Link>
      </div>
    );
  }

  const images       = room.images?.length ? room.images : [PLACEHOLDER];
  const phone        = room.ownerPhone?.replace(/\D/g, '') || '';
  const waText       = encodeURIComponent(`Hi, I'm interested in your room: ${room.title} on BASERA`);
  const waLink       = `https://wa.me/91${phone}?text=${waText}`;
  const callLink     = `tel:+91${phone}`;
  const genderClass  = GENDER_COLORS[room.gender]   || 'bg-gray-100 text-gray-600';
  const typeClass    = ROOM_TYPE_COLORS[room.roomType] || 'bg-gray-100 text-gray-600';

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-5 flex items-center gap-1.5">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/listings" className="hover:text-emerald-600">Listings</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-xs">{room.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main image */}
          <div className="rounded-xl overflow-hidden bg-gray-100 h-72 sm:h-96">
            <img
              src={images[activeImg] || PLACEHOLDER}
              alt={room.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImg ? 'border-emerald-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${genderClass}`}>{room.gender}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeClass}`}>{room.roomType}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-snug">{room.title}</h1>
            <div className="flex items-center gap-1.5 text-gray-500 mt-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{room.locality}, Srinagar Garhwal</span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 inline-flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              ₹{Number(room.price).toLocaleString('en-IN')}
            </span>
            <span className="text-gray-500 text-sm">per month</span>
          </div>

          {/* Description */}
          {room.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">About this room</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{room.description}</p>
            </div>
          )}

          {/* Amenities */}
          {room.amenities?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((a) => (
                  <span
                    key={a}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Owner card + CTA */}
        <div className="space-y-5">
          <div className="card p-5 sticky top-24">
            <h2 className="font-semibold text-gray-800 text-lg mb-4 border-b border-gray-100 pb-3">
              Contact Owner
            </h2>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700">
                {room.ownerName?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{room.ownerName || 'Owner'}</p>
                <p className="text-xs text-gray-500">Property Owner</p>
              </div>
            </div>

            {phone ? (
              <div className="space-y-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-base shadow-sm"
                  data-testid="whatsapp-btn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp Owner
                </a>

                <a
                  href={callLink}
                  className="flex items-center justify-center gap-2 w-full btn-secondary py-3 rounded-xl text-base"
                  data-testid="call-btn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
                  </svg>
                  Call Owner
                </a>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">Contact info not available.</p>
            )}

            {/* Room quick info */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="font-medium">{room.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gender</span>
                <span className="font-medium">{room.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Locality</span>
                <span className="font-medium">{room.locality}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Rooms */}
      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Rooms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similar.map((r) => (
              <RoomCard key={r._id} room={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
