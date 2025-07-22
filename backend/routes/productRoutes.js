import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStock // 👈 Import the new controller
} from '../controllers/productController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const stockLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});

// More specific routes first
router.get('/slug/:slug', getProductBySlug);         // GET /api/products/slug/:slug
router.get('/stock', stockLimiter, getProductStock); // GET /api/products/stock
router.get('/', getProducts);                        // GET /api/products

// Generic ID route last
router.get('/:id([0-9]+)', getProductById);         // GET /api/products/:id (numbers only)

router.post('/', upload.single('thumbnail'), createProduct);
router.put('/:id', upload.single('thumbnail'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;