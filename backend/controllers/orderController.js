// backend/controllers/orderController.js
import { Order, OrderItem } from '../models/Order.js';
import { handleError } from '../utils/errorHandler.js';

// eslint-disable-next-line import/prefer-default-export
export async function getOrderById(req, res) {
  const { id } = req.params;

  try {
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const formattedItems = order.items.map((item) => {
      let snapshot = {};
      try {
        snapshot = typeof item.product_snapshot === 'string'
          ? JSON.parse(item.product_snapshot)
          : item.product_snapshot || {};
      } catch (e) {
        snapshot = {};
      }

      return {
        id: item.id,
        productName: item.product_name || snapshot.name || 'Product',
        variantName: item.variant_name || snapshot.variant || null,
        sku: item.sku || snapshot.sku || null,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total),
        image: snapshot.images?.[0]?.url || null,
      };
    });

    res.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        customer: {
          email: order.customer_info?.email || null,
          firstName: order.customer_info?.first_name || '',
          lastName: order.customer_info?.last_name || '',
        },
        items: formattedItems,
        summary: {
          subtotal: parseFloat(order.subtotal),
          taxAmount: parseFloat(order.tax_amount || 0),
          shippingAmount: parseFloat(order.shipping_amount || 0),
          discountAmount: parseFloat(order.discount_amount || 0),
          totalAmount: parseFloat(order.total_amount),
        },
        addresses: {
          shipping: order.shipping_info?.shipping_address || {},
          billing: order.shipping_info?.billing_address || {},
        },
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    handleError(res, error, 'Failed to fetch order details');
  }
}
