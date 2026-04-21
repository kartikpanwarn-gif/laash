import React from 'react';
import { LOCALITIES, ROOM_TYPES, GENDERS } from '../constants.js';

export default function Filters({ filters, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onChange({
      q: '',
      locality: '',
      roomType: '',
      gender: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div id="filters" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-700 text-sm">Filter Rooms</h2>
        {hasFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
            data-testid="reset-filters"
          >
            Reset all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Search */}
        <div className="xl:col-span-2">
          <label className="label">Search</label>
          <input
            type="text"
            name="q"
            value={filters.q}
            onChange={handleChange}
            placeholder="Title, locality..."
            className="input-field"
            data-testid="filter-search"
          />
        </div>

        {/* Locality */}
        <div>
          <label className="label">Locality</label>
          <select
            name="locality"
            value={filters.locality}
            onChange={handleChange}
            className="input-field"
            data-testid="filter-locality"
          >
            <option value="">All localities</option>
            {LOCALITIES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Room Type */}
        <div>
          <label className="label">Room Type</label>
          <select
            name="roomType"
            value={filters.roomType}
            onChange={handleChange}
            className="input-field"
            data-testid="filter-room-type"
          >
            <option value="">All types</option>
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="label">Gender</label>
          <select
            name="gender"
            value={filters.gender}
            onChange={handleChange}
            className="input-field"
            data-testid="filter-gender"
          >
            <option value="">All</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className="flex gap-2 xl:col-span-1">
          <div className="flex-1">
            <label className="label">Min ₹</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="0"
              min="0"
              className="input-field"
              data-testid="filter-min-price"
            />
          </div>
          <div className="flex-1">
            <label className="label">Max ₹</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="∞"
              min="0"
              className="input-field"
              data-testid="filter-max-price"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
