import express from 'express';
import { initializePayment, verifyPayment } from '../controllers/paymentController.js';

const paystackRoutes = express.Router();

// Define routes and connect them to controller functions
paystackRoutes.post('/paystack/init', initializePayment);
paystackRoutes.get('/paystack/verify/:reference', verifyPayment);

export { paystackRoutes };
