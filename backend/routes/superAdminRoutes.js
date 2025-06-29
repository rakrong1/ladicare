// backend/routes/superAdminRoutes.js
import express from 'express';
import { verifyToken } from '../src/middleware/authMiddleware.js';
import requireSuperAdmin from '../src/middleware/requireSuperAdmin.js';

const router = express.Router();

// Protect all routes: must be authenticated and super admin
router.use(verifyToken);
router.use(requireSuperAdmin);

// Example route: Get list of all users
router.get('/users', async (req, res) => {
  try {
    // You can import User model from db/index.js
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Add more superAdmin-only routes as needed...

export default router;
