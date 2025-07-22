import { CartItem, Product } from '../db/index.js';

export class Cart {
  constructor(sessionId, customerId = null) {
    this.sessionId = sessionId;
    this.customerId = customerId;
    this.items = [];
  }

  async upsertItem(productId, variantId = null, quantity = 1) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      // Ensure quantity is a valid number
      const validatedQuantity = Math.max(1, Number(quantity) || 1);
      
      // Get product details
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const where = {
        product_id: productId,
        variant_id: variantId,
        ...(this.customerId ? { customer_id: this.customerId } : { session_id: this.sessionId })
      };

      // Find existing cart item
      const existingItem = await CartItem.findOne({ where });

      if (existingItem) {
        // Update existing item
        await existingItem.update({
          quantity: validatedQuantity,
          price: Number(product.price)
        });
      } else {
        // Create new item
        await CartItem.create({
          product_id: productId,
          variant_id: variantId,
          quantity: validatedQuantity,
          price: Number(product.price),
          customer_id: this.customerId,
          session_id: this.sessionId
        });
      }

      // Return updated cart items
      const updatedItems = await this.loadItems();
      return {
        success: true,
        items: updatedItems
      };
    } catch (error) {
      console.error('❌ Cart upsertItem error:', error);
      throw error;
    }
  }

  async loadItems() {
    try {
      const where = this.customerId
        ? { customer_id: this.customerId }
        : { session_id: this.sessionId };

      const items = await CartItem.findAll({
        where,
        include: [{ model: Product, as: 'product' }],
        order: [['created_at', 'DESC']],
      });

      const mapped = items.map(item => ({
        id: item.id,
        productId: String(item.product_id),
        variantId: item.variant_id ? String(item.variant_id) : null,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price || item.product?.price || 0),
        name: item.product?.name || 'Unknown Product',
        image: item.product?.thumbnail || '',
        stock_quantity: Number(item.product?.stock_quantity) || 0
      }));

      this.items = mapped;
      return mapped;
    } catch (error) {
      console.error('❌ Cart loadItems error:', error);
      return [];
    }
  }

  async removeItem(productId, variantId = null) {
    try {
      const where = this.customerId
        ? { customer_id: this.customerId, product_id: productId, variant_id: variantId }
        : { session_id: this.sessionId, product_id: productId, variant_id: variantId };

      await CartItem.destroy({ where });
      
      const updatedItems = await this.loadItems();
      return {
        success: true,
        items: updatedItems
      };
    } catch (error) {
      console.error('❌ Cart removeItem error:', error);
      throw error;
    }
  }

  async updateQuantity(productId, variantId = null, quantity) {
    try {
      // Validate and convert quantity
      const validatedQuantity = Math.max(0, Number(quantity) || 0);

      if (validatedQuantity <= 0) {
        return await this.removeItem(productId, variantId);
      }

      const where = this.customerId
        ? { customer_id: this.customerId, product_id: productId, variant_id: variantId }
        : { session_id: this.sessionId, product_id: productId, variant_id: variantId };

      // Find the cart item
      const item = await CartItem.findOne({ where });
      if (!item) {
        throw new Error('Cart item not found');
      }

      // Update the quantity
      await item.update({ quantity: validatedQuantity });
      
      // Return updated cart items
      return await this.loadItems();
    } catch (error) {
      console.error('❌ Cart updateQuantity error:', error);
      throw error;
    }
  }

  async clear() {
    try {
      const where = this.customerId
        ? { customer_id: this.customerId }
        : { session_id: this.sessionId };

      await CartItem.destroy({ where });
      this.items = [];
      
      return {
        success: true,
        items: []
      };
    } catch (error) {
      console.error('❌ Cart clear error:', error);
      throw error;
    }
  }
}