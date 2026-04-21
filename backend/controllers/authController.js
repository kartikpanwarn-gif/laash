const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper ────────────────────────────────────────────────────────────────
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

// ─── POST /api/auth/register ───────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone, role });
    const token = generateToken(user._id, user.role);

    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    console.error('register error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    // req.user is already set by protect middleware
    return res.status(200).json({ user: sanitizeUser(req.user) });
  } catch (error) {
    console.error('me error:', error);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
};

module.exports = { register, login, me };
