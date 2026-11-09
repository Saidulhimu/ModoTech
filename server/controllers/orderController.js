import Order from '../models/Order.js';
import { isDBConnected } from '../config/db.js';

let memoryOrders = [];

/**
 * @desc   Create new order
 * @route  POST /api/orders
 * @access Public / Authenticated
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      deliveryArea,
      deliveryNote,
      paymentMethod,
      coupon,
      itemsPrice,
      discountPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    if (isDBConnected()) {
      const order = new Order({
        user: req.user?._id || null,
        orderItems,
        shippingAddress,
        deliveryArea: deliveryArea || 'inside_dhaka',
        deliveryNote: deliveryNote || '',
        paymentMethod: paymentMethod || 'Cash on Delivery',
        coupon: coupon || null,
        itemsPrice,
        discountPrice: discountPrice || 0,
        shippingPrice,
        totalPrice,
      });
      const createdOrder = await order.save();
      return res.status(201).json(createdOrder);
    }

    // In-memory fallback
    const newOrder = {
      _id: `ord_${Date.now()}`,
      user: req.user || { name: 'Customer' },
      orderItems,
      shippingAddress,
      deliveryArea: deliveryArea || 'inside_dhaka',
      deliveryNote: deliveryNote || '',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      coupon: coupon || null,
      itemsPrice,
      discountPrice: discountPrice || 0,
      shippingPrice,
      totalPrice,
      isPaid: false,
      orderStatus: 'Pending',
      createdAt: new Date(),
    };
    memoryOrders.unshift(newOrder);
    return res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single order by ID
 * @route  GET /api/orders/:id
 * @access Public
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDBConnected()) {
      const order = await Order.findById(id).populate('user', 'name email');
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json(order);
    }

    const order = memoryOrders.find((o) => String(o._id) === String(id));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get logged in user orders
 * @route  GET /api/orders/myorders
 * @access Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    }

    return res.json(memoryOrders);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all orders (Admin)
 * @route  GET /api/orders
 * @access Private (Admin)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
      return res.json(orders);
    }

    return res.json(memoryOrders);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update order status
 * @route  PUT /api/orders/:id/status
 * @access Private (Admin)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (isDBConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.orderStatus = orderStatus;
      if (orderStatus === 'Delivered') order.deliveredAt = Date.now();
      const updated = await order.save();
      return res.json(updated);
    }

    const order = memoryOrders.find((o) => String(o._id) === String(id));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = orderStatus;
    return res.json(order);
  } catch (error) {
    next(error);
  }
};

