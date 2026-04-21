import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';

// Pages
import Home         from './pages/Home.jsx';
import Listings     from './pages/Listings.jsx';
import RoomDetail   from './pages/RoomDetail.jsx';
import Login        from './pages/Login.jsx';
import Register     from './pages/Register.jsx';
import AddListing   from './pages/AddListing.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import EditListing  from './pages/EditListing.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"              element={<Home />} />
          <Route path="/listings"      element={<Listings />} />
          <Route path="/rooms/:id"     element={<RoomDetail />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />

          {/* Owner-protected */}
          <Route path="/add-listing"       element={<AddListing />} />
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/rooms/:id/edit"    element={<EditListing />} />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-7xl mb-4">🗺️</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">404 — Page not found</h2>
                <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary">Go to Home</a>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
