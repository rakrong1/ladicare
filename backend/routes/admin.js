import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, Category, Order, AdminLog } from '../db/index.js';
import requireSuperAdmin from '../src/middleware/requireSuperAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 🔓 Dev-only override: logs in a default superAdmin
if (process.env.NODE_ENV === 'development') {
  router.use((req, res, next) => {
    req.user = {
      id: 1,
      email: 'super@ladicare.com',
      role: 'superAdmin'
    };
    next();
  });
}

// 🖼️ File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const isValid =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    cb(isValid ? null : new Error('Only images and videos are allowed'), isValid);
  }
});

// 📋 Logger middleware
router.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (res.statusCode < 400) {
      AdminLog.create({
        action: req.method,
        resource_type: req.route?.path || req.path,
        resource_id: req.params?.id || null,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          duration: `${Date.now() - start}ms`
        },
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      }).catch(console.error);
    }
  });
  next();
});

// ========================= PRODUCT ROUTES =========================

router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (category) where.category_id = category;

    const products = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: products.rows,
      pagination: {
        page: +page,
        limit: +limit,
        total: products.count,
        pages: Math.ceil(products.count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: err.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: err.message });
  }
});

router.post(
  '/products',
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const { name, description, price, category_id } = req.body;

      if (!name || !price || !category_id) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const images = req.files?.images?.map(f => `/uploads/${f.filename}`) || [];
      const videos = req.files?.videos?.map(f => `/uploads/${f.filename}`) || [];

      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        category_id: parseInt(category_id),
        images,
        videos,
        status: 'pending'
      });

      res.status(201).json({ success: true, message: 'Product created', data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error creating product', error: err.message });
    }
  }
);

router.put(
  '/products/:id',
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

      const { name, description, price, category_id } = req.body;

      const newImages = req.files?.images?.map(f => `/uploads/${f.filename}`);
      const newVideos = req.files?.videos?.map(f => `/uploads/${f.filename}`);

      await product.update({
        name: name || product.name,
        description: description || product.description,
        price: price ? parseFloat(price) : product.price,
        category_id: category_id ? parseInt(category_id) : product.category_id,
        images: newImages || product.images,
        videos: newVideos || product.videos,
        status: 'pending'
      });

      res.json({ success: true, message: 'Product updated', data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error updating product', error: err.message });
    }
  }
);

router.put('/products/:id/approve', requireSuperAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.update({ status: 'approved' });
    res.json({ success: true, message: 'Product approved', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error approving product', error: err.message });
  }
});

router.put('/products/:id/reject', requireSuperAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.update({ status: 'rejected', rejection_reason: reason });
    res.json({ success: true, message: 'Product rejected', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error rejecting product', error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.destroy();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting product', error: err.message });
  }
});

// ========================= CATEGORY ROUTES =========================

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating category', error: err.message });
  }
});

// ========================= ADMIN LOGS =========================

router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const logs = await AdminLog.findAndCountAll({
      limit: +limit,
      offset: +offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: logs.rows,
      pagination: {
        page: +page,
        limit: +limit,
        total: logs.count,
        pages: Math.ceil(logs.count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching logs', error: err.message });
  }
});

// ========================= DASHBOARD STATS =========================

router.get('/dashboard/stats', async (req, res) => {
  try {
    const [total, pending, approved, rejected, categories, orders] = await Promise.all([
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
        products: { total, pending, approved, rejected },
        categories,
        orders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: err.message });
  }
});

// ✅ Welcome route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ladicare Admin API',
    available: [
      '/products',
      '/categories',
      '/dashboard/stats',
      '/logs'
    ]
  });
});

export default router;
