/* eslint-disable import/prefer-default-export */
// backend/models/Order.js
import { Order as OrderModel, OrderItem, Product } from '../db/index.js';

export class Order {
  constructor(data) {
    this.id = data.id;
    this.orderNumber = data.order_number;
    this.customerId = data.customer_id;
    this.email = data.email;
    this.status = data.status;
    this.paymentStatus = data.payment_status;
    this.subtotal = parseFloat(data.subtotal);
    this.taxAmount = parseFloat(data.tax_amount || 0);
    this.shippingAmount = parseFloat(data.shipping_amount || 0);
    this.discountAmount = parseFloat(data.discount_amount || 0);
    this.totalAmount = parseFloat(data.total_amount);
    this.shippingAddress = data.shipping_address;
    this.billingAddress = data.billing_address;
    this.items = data.items || [];
    this.createdAt = data.created_at;
  }

  static generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `LD${timestamp.slice(-6)}${random}`;
  }

  static async create(orderData) {
    const orderNumber = this.generateOrderNumber();
    const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAmount = orderData.taxAmount || 0;
    const shippingAmount = orderData.shippingAmount || 0;
    const discountAmount = orderData.discountAmount || 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    const createdOrder = await OrderModel.create({
      order_number: orderNumber,
      customer_id: orderData.customerId,
      email: orderData.email,
      status: 'pending',
      payment_status: 'unpaid',
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      shipping_address: orderData.shippingAddress,
      billing_address: orderData.billingAddress
    });

    // Add order items
    for (const item of orderData.items) {
      await OrderItem.create({
        order_id: createdOrder.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.quantity * item.price
      });
    }

    // Return wrapped instance
    return new Order({
      ...createdOrder.dataValues,
      items: orderData.items
    });
  }

  async addItem(productId, variantId, quantity, price) {
    const item = await OrderItem.create({
      order_id: this.id,
      product_id: productId,
      variant_id: variantId || null,
      quantity,
      unit_price: price,
      subtotal: quantity * price
    });
    this.items.push(item);
    return item;
  }

  async updateStatus(newStatus) {
    const updated = await OrderModel.update(
      {
        status: newStatus,
        ...(newStatus === 'shipped' && { shipped_at: new Date() }),
        ...(newStatus === 'delivered' && { delivered_at: new Date() })
      },
      { where: { id: this.id }, returning: true }
    );
    this.status = newStatus;
    return updated[1][0];
  }

  get isPaid() {
    return this.paymentStatus === 'paid';
  }

  get canBeCancelled() {
    return ['pending', 'confirmed'].includes(this.status);
  }
}
