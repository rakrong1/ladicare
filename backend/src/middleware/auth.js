/* eslint-disable arrow-body-style */
// backend/middleware/auth.js

import jwt from 'jsonwebtoken';
import { User } from '../../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// ✅ Verify token and attach user to request
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.user = user;

    // Optional debug logging for development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Authenticated ${user.email} as ${user.role}`);
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }

    console.error('[AUTH ERROR]:', err);
    return res.status(500).json({ message: 'Server error during token validation' });
  }
};

// ✅ Require a specific role
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Forbidden: Requires ${role} role` });
    }
    next();
  };
};

// ✅ Require one of multiple roles
export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Requires one of roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};
