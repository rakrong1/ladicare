// backend/src/routes/productRoutes.js

import { Router } from 'express';
import { getProductById } from '../controllers/productController.js'; // ✅ corrected path

const router = Router();

// Get product by ID (or slug if changed later)
router.get('/id/:id', getProductById);
// router.get('/slug/:slug', getProductBySlug);

export default router;
