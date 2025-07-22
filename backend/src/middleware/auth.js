/* eslint-disable arrow-body-style */
// backend/middleware/auth.js

import jwt from 'jsonwebtoken';
import { User } from '../../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET';
if (!JWT_SECRET || JWT_SECRET === 'YOUR_FALLBACK_SECRET') {
  console.error('JWT_SECRET is not set properly in environment variables');
  process.exit(1);
}

// ✅ Middleware: Verify JWT and attach user to `req.user`
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];


  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!decoded?.id) return res.status(401).json({ message: 'Unauthorized: Invalid payload' });


    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.user = user;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH ✅] ${user.email} authenticated as ${user.role}`);
    }

    next();
  } catch (err) {
    const msg =
      err.name === 'TokenExpiredError'
        ? 'Unauthorized: Token expired'
        : err.name === 'JsonWebTokenError'
        ? 'Unauthorized: Invalid token'
        : 'Server error during token validation';

    const code = ['TokenExpiredError', 'JsonWebTokenError'].includes(err.name) ? 401 : 500;

    if (process.env.NODE_ENV !== 'production') {
      console.error('[AUTH ERROR]', err);
    }

    return res.status(code).json({ message: msg });
  }
};

// ✅ Middleware: Require a single role (e.g., 'admin')
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Forbidden: Requires '${role}' role` });
    }
    next();
  };
};

// ✅ Middleware: Require one of multiple roles (e.g., 'admin', 'superAdmin')
export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const { role } = req.user;

    // Allow superAdmin to bypass all role checks
    if (role === 'superAdmin') return next();

    if (!roles.includes(role)) {
      return res.status(403).json({
        message: `Forbidden: Requires one of these roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};
