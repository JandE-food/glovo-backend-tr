const express = require('express');
const mongoose = require('mongoose');

const Order = require('../models/Order.js');
const { isFallbackId } = require('../utils/idHelpers.js');

const router = express.Router();

const fallbackOrders = [];

const emitOrderReceived = (io, order) => {
  io.to('merchants').emit('order_received', order);
};

const emitStatusChanged = (io, order) => {
  io.to(`customer:${order.userId ?? 'guest'}`).emit('order_status_changed', order);
};

const emitDriverOrderAvailable = (io, order) => {
  io.to('drivers').emit('driver_order_available', order);
};

const getOrdersHandler = async (request, response) => {
  const userId = request.params.userId
    ? String(request.params.userId)
    : request.query.userId
      ? String(request.query.userId)
      : undefined;

  if (mongoose.connection.readyState === 1) {
    const filtre = userId ? { userId } : {};
    const orders = await Order.find(filtre).sort({ createdAt: -1 }).lean();

    response.json({ orders });
    return;
  }

  response.json({
    orders: userId
      ? fallbackOrders.filter((order) => order.userId === userId)
      : fallbackOrders
  });
};

router.get('/', getOrdersHandler);
router.get('/:userId', getOrdersHandler);

router.post('/', async (request, response) => {
  const io = request.app.get('io');
  const payload = request.body ?? {};

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    response.status(400).json({
      message: 'Order items cannot be empty'
    });
    return;
  }

  const orderData = {
    userId: String(payload.userId ?? 'user-1'),
    restaurantId: String(payload.restaurantId ?? ''),
    items: payload.items.map((item) => ({
      productId: String(item.productId ?? item.urunId ?? ''),
      name: String(item.name ?? item.ad ?? ''),
      quantity: Number(item.quantity ?? item.adet ?? 0),
      price: Number(item.price ?? item.fiyat ?? 0)
    })),
    totalAmount: Number(payload.totalAmount ?? payload.toplamTutar ?? payload.total ?? 0),
    paymentMethod: payload.paymentMethod ?? payload.odemeYontemi ?? 'card',
    paymentStatus: payload.paymentStatus ?? payload.odemeDurumu ?? 'paid',
    paymentTransactionId: String(
      payload.paymentTransactionId ?? payload.odemeIslemId ?? ''
    ),
    deliveryAddress: payload.deliveryAddress ?? payload.teslimatAdresi ?? null,
    status: 'received'
  };

  if (mongoose.connection.readyState === 1) {
    const order = await Order.create(orderData);
    if (order.paymentStatus === 'paid') {
      emitOrderReceived(io, order);
    }

    response.status(201).json({
      message: 'Order created',
      order
    });
    return;
  }

  const order = {
    id: `order-${Date.now()}`,
    ...orderData,
    createdAt: new Date().toISOString()
  };

  fallbackOrders.unshift(order);
  if (order.paymentStatus === 'paid') {
    emitOrderReceived(io, order);
  }

  response.status(201).json({
    message: 'Order created',
    order
  });
});

router.patch('/:orderId/status', async (request, response) => {
  const io = request.app.get('io');
  const { orderId } = request.params;
  const nextStatus = request.body?.status ?? request.body?.durum;

  if (!nextStatus) {
    response.status(400).json({
      message: 'A new order status is required'
    });
    return;
  }

  if (mongoose.connection.readyState === 1) {
    // Check if orderId is a fallback ID
    if (isFallbackId(orderId)) {
      response.status(404).json({
        message: 'Order not found'
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: nextStatus },
      { new: true }
    );

    if (!order) {
      response.status(404).json({
        message: 'Order not found'
      });
      return;
    }

    emitStatusChanged(io, order);
    if (String(nextStatus) === 'preparing') {
      emitDriverOrderAvailable(io, order);
    }

    response.json({
      message: 'Order status updated',
      order
    });
    return;
  }

  const orderIndex = fallbackOrders.findIndex((entry) => entry.id === orderId);

  if (orderIndex === -1) {
    response.status(404).json({
      message: 'Order not found'
    });
    return;
  }

  fallbackOrders[orderIndex] = {
    ...fallbackOrders[orderIndex],
    status: nextStatus
  };

  emitStatusChanged(io, fallbackOrders[orderIndex]);
  if (String(nextStatus) === 'preparing') {
    emitDriverOrderAvailable(io, fallbackOrders[orderIndex]);
  }

  response.json({
    message: 'Order status updated',
    order: fallbackOrders[orderIndex]
  });
});

router.fallbackOrders = fallbackOrders;
router.emitStatusChanged = emitStatusChanged;
router.emitOrderReceived = emitOrderReceived;

module.exports = router;
