import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios.js';
import RoomCard from '../components/RoomCard.jsx';
import Filters from '../components/Filters.jsx';

const DEFAULT_FILTERS = {
  q: '',
  locality: '',
  roomType: '',
  gender: '',
  minPrice: '',
  maxPrice: '',
};

export default function Listings() {
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filters, setFilters]   = useState(DEFAULT_FILTERS);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const LIMIT = 12;

  const fetchRooms = useCallback(async (activeFilters, activePage) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: activePage, limit: LIMIT };
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v !== '') params[k] = v;
      });
      const { data } = await api.get('/rooms', { params });
      const list  = Array.isArray(data) ? data : (data.rooms || []);
      const count = data.total ?? list.length;
      setRooms(list);
      setTotal(count);
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms(filters, page);
  }, [filters, page, fetchRooms]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Available Rooms</h1>
        <p className="text-gray-500 text-sm">
          {loading ? 'Loading...' : `${total} room${total !== 1 ? 's' : ''} found in Srinagar Garhwal`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Filters filters={filters} onChange={handleFilterChange} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
          <span>⚠️</span> {error}
          <button
            onClick={() => fetchRooms(filters, page)}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div id="listings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <>
          <div
            id="listings-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      pg === page
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        !error && (
          <div className="text-center py-20 text-gray-400" id="listings-grid">
            <div className="text-6xl mb-4">🏘️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No rooms found</h3>
            <p className="text-sm">Try adjusting your filters or check back later.</p>
          </div>
        )
      )}
    </div>
  );
}
