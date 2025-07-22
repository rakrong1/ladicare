import { Cart } from '../models/Cart.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to extract user ID from JWT
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

// POST /api/cart/upsert
export const upsertCartItem = async (req, res) => {
  const { sessionId, productId, variantId, quantity } = req.body;
  const customerId = extractUserId(req);

  if (!sessionId && !customerId) {
    return res.status(400).json({ success: false, message: 'Missing session or user' });
  }
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  try {
    const cart = new Cart(sessionId, customerId);
    await cart.upsertItem(productId, variantId || null, quantity);
    const items = await cart.loadItems();
    res.json({ success: true, items });
  } catch (err) {
    console.error('❌ Upsert error:', err);
    res.status(500).json({ success: false, items: [], message: 'Failed to upsert item' });
  }
};