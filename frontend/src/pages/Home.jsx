import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import RoomCard from '../components/RoomCard.jsx';

const FEATURES = [
  { icon: '🏠', title: 'Verified Listings', desc: 'All rooms posted by real local owners in Srinagar Garhwal.' },
  { icon: '📍', title: 'Hyperlocal', desc: 'Find rooms near HNBGU Campus, Bus Stand, Bada Bazaar & more.' },
  { icon: '💬', title: 'Direct Contact', desc: 'Connect instantly with owners via WhatsApp or phone — no middlemen.' },
  { icon: '🔍', title: 'Smart Filters', desc: 'Filter by price, locality, room type, and preferred gender occupancy.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rooms?limit=4')
      .then((res) => {
        const rooms = Array.isArray(res.data) ? res.data : (res.data.rooms || []);
        setFeatured(rooms.slice(0, 4));
      })
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 text-white overflow-hidden">
        {/* Decorative mountain silhouette */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path fill="white" fillOpacity="1"
              d="M0,224L80,197.3C160,171,320,117,480,128C640,139,800,213,960,234.7C1120,256,1280,224,1360,208L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
          </svg>
          <svg viewBox="0 0 1440 320" className="absolute bottom-8 w-full opacity-60" preserveAspectRatio="none">
            <path fill="white" fillOpacity="0.5"
              d="M0,128L60,149.3C120,171,240,213,360,208C480,203,600,149,720,138.7C840,128,960,160,1080,181.3C1200,203,1320,213,1380,218.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span>📍</span>
            <span>Srinagar Garhwal, Uttarakhand</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-sm">
            Find your perfect room<br className="hidden sm:block" />
            <span className="text-emerald-200"> in Srinagar Garhwal</span>
          </h1>

          <p className="text-emerald-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            BASERA connects students &amp; working professionals with trusted room owners across Srinagar Garhwal — fast, simple, and free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/listings"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg"
              data-testid="hero-browse-btn"
            >
              🔍 Browse Rooms
            </Link>
            <Link
              to="/register"
              className="bg-emerald-800/60 hover:bg-emerald-800/80 border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors backdrop-blur-sm"
              data-testid="hero-owner-btn"
            >
              🏠 Register as Owner
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
            {[['Free', 'Always'], ['Instant', 'Contact'], ['Local', 'Listings']].map(([top, bot]) => (
              <div key={top} className="bg-white/10 backdrop-blur-sm rounded-xl py-3 px-2">
                <div className="font-bold text-lg">{top}</div>
                <div className="text-emerald-200 text-xs">{bot}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-container">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Why BASERA?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="page-container pt-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Rooms</h2>
          <Link to="/listings" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🏘️</div>
            <p className="font-medium">No listings yet — be the first to post!</p>
            <Link to="/register" className="btn-primary mt-4 inline-block">Get Started</Link>
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-14 px-4 mt-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Own a room in Srinagar Garhwal?</h2>
          <p className="text-emerald-100 mb-7 text-lg">
            List it on BASERA for free and connect with hundreds of seekers instantly.
          </p>
          <Link
            to="/register"
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-3.5 rounded-xl text-base transition-colors inline-block shadow-lg"
          >
            Start Listing for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm text-center py-6">
        <p>© {new Date().getFullYear()} BASERA — Srinagar Garhwal, Uttarakhand. Built with ❤️</p>
      </footer>
    </div>
  );
}
