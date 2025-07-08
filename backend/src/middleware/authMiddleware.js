// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// ✅ Middleware: Verify JWT and attach user object to req
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token: User not found.' });
    }

    req.user = user; // Attach user to the request for future use
    next();
  } catch (err) {
    console.error('[Auth Error]:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token.' });
    }

    return res.status(500).json({ message: 'Token verification failed.' });
  }
};

// ✅ Middleware: Require a specific user role
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Access denied. Requires role: ${role}` });
    }
    next();
  };
};

// ✅ Middleware: Require one of multiple roles
export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
};
