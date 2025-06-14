/* eslint-disable import/prefer-default-export */
// backend/models/Cart.js
import { CartItem, Product } from '../db/index.js'; // CartItem = Sequelize model for cart_items

export class Cart {
  constructor(sessionId, customerId = null) {
    this.sessionId = sessionId;
    this.customerId = customerId;
    this.items = [];
  }

  // Load cart items from DB into this.items
  async loadItems() {
    const where = this.customerId
      ? { customer_id: this.customerId }
      : { session_id: this.sessionId };

    this.items = await CartItem.findAll({
      where,
      include: [{ model: Product, as: 'product' }]
    });
  }

  // Add or update cart item
  async addItem(productId, variantId = null, quantity = 1) {
    const where = this.customerId
      ? { customer_id: this.customerId, product_id: productId, variant_id: variantId }
      : { session_id: this.sessionId, product_id: productId, variant_id: variantId };

    const existingItem = await CartItem.findOne({ where });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return existingItem;
    } else {
      const product = await Product.findByPk(productId);
      if (!product) throw new Error('Product not found');

      const newItem = await CartItem.create({
        session_id: this.sessionId,
        customer_id: this.customerId,
        product_id: productId,
        variant_id: variantId,
        quantity,
        price: product.price
      });

      return newItem;
    }
  }

  // Remove item completely
  async removeItem(productId, variantId = null) {
    const where = this.customerId
      ? { customer_id: this.customerId, product_id: productId, variant_id: variantId }
      : { session_id: this.sessionId, product_id: productId, variant_id: variantId };

    await CartItem.destroy({ where });
  }

  // Update item quantity
  async updateQuantity(productId, variantId, quantity) {
    if (quantity <= 0) {
      return await this.removeItem(productId, variantId);
    }

    const where = this.customerId
      ? { customer_id: this.customerId, product_id: productId, variant_id: variantId }
      : { session_id: this.sessionId, product_id: productId, variant_id: variantId };

    const item = await CartItem.findOne({ where });
    if (!item) throw new Error('Item not found');

    item.quantity = quantity;
    await item.save();
    return item;
  }

  // Clear all items
  async clear() {
    const where = this.customerId
      ? { customer_id: this.customerId }
      : { session_id: this.sessionId };

    await CartItem.destroy({ where });
    this.items = [];
  }

  // Calculate total quantity of items
  get totalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Calculate total cost
  get subtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}
