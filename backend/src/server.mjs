import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

import { initializeDatabase } from '../db/index.js';

import footerRoutes from '../routes/footerRoutes.js';
import contactRoutes from '../routes/contactRoutes.js';
import adminRoutes from '../routes/admin.js';
import { paystackRoutes } from '../routes/paymentRoutes.js';
import apiRoutes from '../routes/api.js';
import categoryRoutes from '../routes/categoryRoutes.js';
import productRoutes from '../routes/productRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import { router as cartRoutes } from '../routes/cartRoutes.js';

// Load env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

// ─── Middleware Setup ────────────────────────────────

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8081'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ladicare E-commerce API',
      version: '1.0.0',
      description: 'API documentation for Ladicare backend'
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// Logging
app.use(morgan(ENV === 'production' ? 'combined' : 'dev'));

// ─── Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', paystackRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', apiRoutes); // Generic routes fallback

// ─── Health Check & Root ─────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.send('🚀 Ladicare backend is running');
});

// ─── Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max size is 10MB.' });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ success: false, message: 'Too many files uploaded.' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      field: err.errors[0].path
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(ENV === 'development' && { stack: err.stack }),
  });
});

// ─── 404 Fallback ─────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Shutdown Handling ───────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n🔌 Received ${signal}. Shutting down...`);
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// ─── Start Server ─────────────────────────────────────
const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`\n🟢 Ladicare API Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${ENV}`);
      console.log(`✅ Health Check: http://localhost:${PORT}/health`);
      console.log(`🛒 Products API: http://localhost:${PORT}/api/products`);
      console.log(`🔐 Admin Panel: http://localhost:${PORT}/api/admin`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
