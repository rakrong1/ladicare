// backend/src/routes/admin.js - Complete Admin routes with Super Admin role check

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, Category, Order, AdminLog } from '../db/index.js';
import requireSuperAdmin from '../src/middleware/requireSuperAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 🔐 TEMPORARY MOCK - Replace with real auth later
router.use((req, res, next) => {
  req.user = {
    id: 1,
    email: 'super@ladicare.com',
    role: 'super_admin' // Change to 'admin' to test role restriction
  };
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images and videos are allowed'));
  }
});

// Admin logging middleware
const logAdminAction = async (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      AdminLog.create({
        action: req.method,
        resource_type: req.route?.path || req.path,
        resource_id: req.params.id || null,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          timestamp: new Date().toISOString()
        }
      }).catch(err => console.error('Logging error:', err));
    }
    originalSend.call(this, data);
  };
  next();
};

router.use(logAdminAction);

// Get all products
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category_id = category;

    const products = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, as: 'category' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: products.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.count,
        pages: Math.ceil(products.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
});

// Create product
router.post('/products', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const { name, description, price, category_id } = req.body;
    const images = req.files?.images?.map(f => `/uploads/${f.filename}`) || [];
    const videos = req.files?.videos?.map(f => `/uploads/${f.filename}`) || [];

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category_id: parseInt(category_id),
      images: JSON.stringify(images),
      videos: JSON.stringify(videos),
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
  }
});

// Update product
router.put('/products/:id', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const { name, description, price, category_id } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const images = req.files?.images?.map(f => `/uploads/${f.filename}`) || JSON.parse(product.images || '[]');
    const videos = req.files?.videos?.map(f => `/uploads/${f.filename}`) || JSON.parse(product.videos || '[]');

    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      category_id: category_id ? parseInt(category_id) : product.category_id,
      images: JSON.stringify(images),
      videos: JSON.stringify(videos),
      status: 'pending'
    });

    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
  }
});

// ✅ Approve product — Super Admin only
router.put('/products/:id/approve', requireSuperAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.update({ status: 'approved' });
    res.json({ success: true, message: 'Product approved', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving product', error: error.message });
  }
});

// ✅ Reject product — Super Admin only
router.put('/products/:id/reject', requireSuperAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.update({ status: 'rejected', rejection_reason: reason });
    res.json({ success: true, message: 'Product rejected', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting product', error: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.destroy();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
  }
});

// Category management
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
  }
});

// Admin logs
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const logs = await AdminLog.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: logs.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.count,
        pages: Math.ceil(logs.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching logs', error: error.message });
  }
});

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [totalProducts, pendingProducts, approvedProducts, rejectedProducts, totalCategories, totalOrders] = await Promise.all([
      Product.count(),
      Product.count({ where: { status: 'pending' } }),
      Product.count({ where: { status: 'approved' } }),
      Product.count({ where: { status: 'rejected' } }),
      Category.count(),
      Order.count()
    ]);

    res.json({
      success: true,
      data: {
        products: { total: totalProducts, pending: pendingProducts, approved: approvedProducts, rejected: rejectedProducts },
        categories: totalCategories,
        orders: totalOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
});

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Admin API',
    endpoints: [
      '/products',
      '/categories',
      '/dashboard/stats',
      '/logs',
    ]
  });
});


export default router;
