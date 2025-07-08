// backend/routes/cartRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { Cart } from '../models/Cart.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function extractUserId(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

// 🔁 Sync cart (guest or auth)
router.post('/sync', async (req, res) => {
  const { sessionId, items = [] } = req.body;
  const customerId = extractUserId(req);

  const cart = new Cart(sessionId, customerId);

  try {
    await Promise.all(
      items.map(item =>
        cart.addItem(item.id, item.variant_id || null, item.quantity)
      )
    );
    res.status(200).json({ success: true, message: 'Cart synced successfully' });
  } catch (err) {
    console.error('❌ Sync error:', err);
    res.status(500).json({ success: false, message: 'Failed to sync cart' });
  }
});

// 🛒 Load cart
router.get('/', async (req, res) => {
  const sessionId = req.query.sessionId?.toString() || null;
  const customerId = extractUserId(req);

  if (!sessionId && !customerId) {
    return res.status(400).json({ success: false, message: 'Missing session or user' });
  }

  const cart = new Cart(sessionId, customerId);

  try {
    const items = await cart.loadItems();
    res.json({ success: true, items });
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to load cart' });
  }
});

export default router;
