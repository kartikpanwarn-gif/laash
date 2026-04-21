import React from 'react';
import { Link } from 'react-router-dom';
import { GENDER_COLORS, ROOM_TYPE_COLORS } from '../constants.js';

const PLACEHOLDER = 'https://placehold.co/400x260/d1fae5/047857?text=BASERA';

export default function RoomCard({ room }) {
  if (!room) return null;

  const {
    _id,
    title,
    locality,
    price,
    gender,
    roomType,
    images = [],
  } = room;

  const imgSrc = images[0] || PLACEHOLDER;
  const genderClass = GENDER_COLORS[gender] || 'bg-gray-100 text-gray-600';
  const typeClass   = ROOM_TYPE_COLORS[roomType] || 'bg-gray-100 text-gray-600';

  return (
    <div
      className="card hover:shadow-md transition-shadow duration-200 flex flex-col"
      data-testid="room-card"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          loading="lazy"
        />
        <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${genderClass}`}>
          {gender}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{title}</h3>

        <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{locality}</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-emerald-700 font-bold text-base">
            ₹{Number(price).toLocaleString('en-IN')}
            <span className="text-gray-400 font-normal text-xs">/mo</span>
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeClass}`}>
            {roomType}
          </span>
        </div>

        <div className="mt-auto pt-3">
          <Link
            to={`/rooms/${_id}`}
            className="block w-full text-center btn-primary text-sm py-2"
            data-testid={`view-room-${_id}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
