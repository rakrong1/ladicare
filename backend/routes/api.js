// backend/src/routes/index.js or api.js
import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Simple test endpoint
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

export default router;
