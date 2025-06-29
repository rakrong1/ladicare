/* eslint-disable no-multi-spaces */
// backend/routes/productRoutes.js
import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Routes relative to /api/products
router.get('/', getProducts);                         // GET /api/products
router.get('/:id', getProductById);                   // GET /api/products/:id
router.post('/', upload.single('thumbnail'), createProduct); // POST /api/products
router.put('/:id', upload.single('thumbnail'), updateProduct); // PUT /api/products/:id
router.delete('/:id', deleteProduct);                 // DELETE /api/products/:id

export default router;
