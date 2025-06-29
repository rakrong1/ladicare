// routes/footerRoutes.js
import express from 'express';
import { getFooter } from '../controllers/footerController.js';

const router = express.Router();

// Public API route
router.get('/', getFooter); // <-- THIS makes /api/footer work


export default router;
