import express from 'express';
import jwt from 'jsonwebtoken';
import { Cart } from '../models/Cart.js';
import { upsertCartItem } from '../controllers/cartController.js';

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

// 🛒 GET /api/cart
router.get('/', async (req, res) => {
  const sessionId = req.query.sessionId?.toString() || null;
  const customerId = extractUserId(req);

  if (!sessionId && !customerId) {
    return res.status(400).json({ success: false, message: 'Missing session or user' });
  }

  try {
    const cart = new Cart(sessionId, customerId);
    const items = await cart.loadItems();
    res.json({ success: true, items });
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ success: false, items: [], message: 'Failed to load cart' });
  }
});

// ➕ POST /api/cart/add
router.post('/add', async (req, res) => {
    const { sessionId, productId, variantId, quantity } = req.body;
    const customerId = extractUserId(req);

    if (!sessionId && !customerId) {
        return res.status(400).json({ success: false, message: 'Missing session or user' });
    }

    // --- Suggested Change ---
    // Only check for the productId. Let the service layer handle quantity validation.
    if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    // --- End of Change ---

    try {
        const cart = new Cart(sessionId, customerId);
        // The service will use a default quantity of 1 if none is provided.
        await cart.upsertItem(productId, variantId || null, quantity);
        const items = await cart.loadItems();
        res.json({ success: true, items });
    } catch (err) {
        console.error('❌ Add error:', err);
        res.status(500).json({ success: false, items: [], message: 'Failed to add item' });
    }
});

// 🔄 PUT /api/cart/update
router.put('/update', async (req, res) => {
  try {
    const { productId, variantId, quantity, customerId } = req.body;
    const userId = customerId || extractUserId(req);

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing user ID',
        items: [] 
      });
    }

    if (!productId || quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and quantity are required',
        items: []
      });
    }

    const cart = new Cart(null, userId);
    const result = await cart.updateQuantity(productId, variantId || null, Number(quantity));
    res.json({ success: true, items: result });
  } catch (err) {
    console.error('❌ Update error:', err);
    res.status(500).json({ 
      success: false, 
      items: [], 
      message: err.message || 'Failed to update quantity'
    });
  }
});

// 🗑️ DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.body;
    const customerId = extractUserId(req);

    if (!customerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing user ID' 
      });
    }

    const cart = new Cart(null, customerId);
    const result = await cart.removeItem(productId, variantId || null);
    res.json(result);
  } catch (err) {
    console.error('❌ Remove error:', err);
    res.status(500).json({ 
      success: false, 
      items: [], 
      message: 'Failed to remove item' 
    });
  }
});

// 🧹 DELETE /api/cart/clear
router.delete('/clear', async (req, res) => {
  const { sessionId } = req.query;
  const customerId = extractUserId(req);

  if (!sessionId && !customerId) {
    return res.status(400).json({ success: false, message: 'Missing session or user' });
  }

  try {
    const cart = new Cart(sessionId, customerId);
    await cart.clear();
    res.json({ success: true, items: [] });
  } catch (err) {
    console.error('❌ Clear error:', err);
    res.status(500).json({ success: false, items: [], message: 'Failed to clear cart' });
  }
});

// 🔁 POST /api/cart/sync
router.post('/sync', async (req, res) => {
  const { sessionId, items = [] } = req.body;
  const customerId = extractUserId(req);
  const pid = item.product_id || item.productId;

  if (!sessionId && !customerId) {
    return res.status(400).json({ success: false, message: 'Missing session or user' });
  }

  try {
    const cart = new Cart(sessionId, customerId);

    // Ensure existing cart is cleared to avoid duplicates
    await cart.clear();

    for (const item of items) {
      if (item.product_id && item.quantity > 0) {
        await cart.upsertItem(item.product_id, item.variant_id || null, item.quantity);
      }
    }

    const updatedItems = await cart.loadItems();
    res.status(200).json({ success: true, items: updatedItems });
  } catch (err) {
    console.error('❌ Sync error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✨ Optional delete route (not used in frontend)
router.delete('/', async (req, res) => {
  const { sessionId } = req.body;
  const customerId = extractUserId(req);

  try {
    const cart = new Cart(sessionId, customerId);
    await cart.clear();
    res.json({ success: true, items: [] });
  } catch (err) {
    res.status(500).json({ success: false, items: [] });
  }
});

// POST /api/cart/upsert
router.post('/upsert', upsertCartItem);

export { router };
