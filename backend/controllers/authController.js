import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'default_secret_key');
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production');
}

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log(`[REGISTER DEBUG] Hashed password: ${hashed}`);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role,
    });

    const token = generateToken(user);

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('❌ Register error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    console.log(`[LOGIN DEBUG] Stored hash: ${user.password}`);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN DEBUG] Password match:`, isValid);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};