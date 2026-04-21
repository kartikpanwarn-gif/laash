import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-emerald-700 font-semibold' : 'text-gray-600 hover:text-emerald-600'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-emerald-700 font-bold text-2xl tracking-tight hover:text-emerald-800 transition-colors"
            data-testid="navbar-logo"
          >
            <span className="text-3xl">🏡</span>
            <span>BASERA</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/listings" className={navLinkClass}>Listings</NavLink>

            {user?.role === 'owner' && (
              <>
                <NavLink to="/add-listing" className={navLinkClass}>
                  <span className="flex items-center gap-1">
                    <span className="text-base">+</span> List Room
                  </span>
                </NavLink>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Hi, <span className="font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm px-4 py-2"
                  data-testid="logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-emerald-50 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-emerald-50 py-3 space-y-1 pb-4">
            {[
              { to: '/', label: 'Home', end: true },
              { to: '/listings', label: 'Listings' },
              ...(user?.role === 'owner'
                ? [
                    { to: '/add-listing', label: '+ List Room' },
                    { to: '/dashboard', label: 'Dashboard' },
                  ]
                : []),
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 px-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Hi, {user.name?.split(' ')[0]}</span>
                  <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-1.5">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm flex-1 text-center">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm flex-1 text-center">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
