import express from 'express';
import { getCategories } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories); // Use controller directly

export default router;
