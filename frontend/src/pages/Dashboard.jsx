import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { GENDER_COLORS, ROOM_TYPE_COLORS } from '../constants.js';

const PLACEHOLDER = 'https://placehold.co/80x60/d1fae5/047857?text=No+Img';

export default function DashboardPage() {
  return (
    <ProtectedRoute role="owner">
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState(null); // id being deleted
  const [confirmId, setConfirmId] = useState(null); // id awaiting confirm

  const fetchMine = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/rooms/mine');
      const list = Array.isArray(data) ? data : (data.rooms || []);
      setRooms(list);
    } catch {
      setError('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMine(); }, [fetchMine]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/rooms/${id}`);
      setRooms((prev) => prev.filter((r) => r._id !== id));
      setConfirmId(null);
    } catch {
      alert('Failed to delete listing. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const stats = {
    total: rooms.length,
    avgPrice: rooms.length
      ? Math.round(rooms.reduce((s, r) => s + Number(r.price || 0), 0) / rooms.length)
      : 0,
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0]}! Manage your listings.</p>
        </div>
        <Link to="/add-listing" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <span>+</span> Add New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Listings', value: stats.total, icon: '🏠' },
          { label: 'Avg. Rent',      value: stats.total ? `₹${stats.avgPrice.toLocaleString('en-IN')}` : '—', icon: '💰' },
          { label: 'Active',         value: stats.total, icon: '✅' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div>
              <div className="text-xl font-bold text-gray-800">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
          <span>⚠️</span> {error}
          <button onClick={fetchMine} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      {/* Listings */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse flex gap-4 p-4">
              <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🏘️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No listings yet</h3>
          <p className="text-sm mb-6">List your first room and start getting enquiries!</p>
          <Link to="/add-listing" className="btn-primary">+ Add Your First Room</Link>
        </div>
      ) : (
        <div className="space-y-4" data-testid="dashboard-listings">
          {rooms.map((room) => {
            const imgSrc      = room.images?.[0] || PLACEHOLDER;
            const genderClass = GENDER_COLORS[room.gender]   || 'bg-gray-100 text-gray-600';
            const typeClass   = ROOM_TYPE_COLORS[room.roomType] || 'bg-gray-100 text-gray-600';

            return (
              <div key={room._id} className="card flex flex-col sm:flex-row gap-0 overflow-hidden hover:shadow-md transition-shadow" data-testid="dashboard-room-card">
                {/* Image */}
                <div className="sm:w-36 h-32 sm:h-auto flex-shrink-0 bg-gray-100">
                  <img
                    src={imgSrc}
                    alt={room.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = PLACEHOLDER; }}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col sm:flex-row flex-1 p-4 gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${genderClass}`}>{room.gender}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeClass}`}>{room.roomType}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{room.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{room.locality}</p>
                    <p className="text-emerald-700 font-bold text-sm mt-1">
                      ₹{Number(room.price).toLocaleString('en-IN')}
                      <span className="text-gray-400 font-normal">/mo</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 items-start sm:items-end justify-end sm:justify-center flex-shrink-0">
                    <Link
                      to={`/rooms/${room._id}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-300 hover:border-emerald-500 px-3 py-1.5 rounded-lg transition-colors"
                      data-testid={`view-${room._id}`}
                    >
                      View
                    </Link>
                    <Link
                      to={`/rooms/${room._id}/edit`}
                      className="text-xs text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-500 px-3 py-1.5 rounded-lg transition-colors"
                      data-testid={`edit-${room._id}`}
                    >
                      Edit
                    </Link>

                    {confirmId === room._id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(room._id)}
                          disabled={deleting === room._id}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                          data-testid={`confirm-delete-${room._id}`}
                        >
                          {deleting === room._id ? '…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(room._id)}
                        className="text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
                        data-testid={`delete-${room._id}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
