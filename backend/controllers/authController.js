// backend/controllers/authController.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// ✅ Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    const token = generateToken(user.id);

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('❌ Register error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// ✅ Login existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
