// backend/src/routes/api.js
import { Router } from 'express';
import { router as cartRoutes } from '../routes/cartRoutes.js';

const router = Router();

// ✅ Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ✅ Test endpoint
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API connection working!',
    data: {
      users: ['Alice', 'Bob', 'Charlie'],
      count: 3
    }
  });
});

// ✅ Optional: root
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ladicare API root',
    endpoints: ['/health', '/test']
  });
});

// Mounting the cart routes
router.use('/cart', cartRoutes);

export default router;
