const mongoose = require('mongoose');

const Order = require('../models/Order.js');
const ordersRouter = require('../routes/orders.js');

const normalizeCoordinateValue = (value) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
};

const normalizeLocation = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const lat = normalizeCoordinateValue(payload.lat ?? payload.latitude);
  const lng = normalizeCoordinateValue(payload.lng ?? payload.longitude);

  if (lat === null || lng === null) {
    return null;
  }

  return {
    lat,
    lng
  };
};

const getFallbackOrder = (orderId) =>
  (ordersRouter.fallbackOrders ?? []).find((entry) => entry.id === orderId);

const saveDriverLocation = async (orderId, driverLocation) => {
  if (mongoose.connection.readyState === 1) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        driverLocation: {
          latitude: driverLocation.lat,
          longitude: driverLocation.lng
        }
      },
      { new: true }
    ).lean();

    return order?.driverLocation
      ? {
          lat: Number(order.driverLocation.latitude),
          lng: Number(order.driverLocation.longitude)
        }
      : driverLocation;
  }

  const fallbackOrder = getFallbackOrder(orderId);
  if (!fallbackOrder) {
    return null;
  }

  fallbackOrder.driverLocation = {
    latitude: driverLocation.lat,
    longitude: driverLocation.lng
  };

  return driverLocation;
};

const getSavedDriverLocation = async (orderId) => {
  if (mongoose.connection.readyState === 1) {
    const order = await Order.findById(orderId).select('driverLocation').lean();
    const latitude = normalizeCoordinateValue(order?.driverLocation?.latitude);
    const longitude = normalizeCoordinateValue(order?.driverLocation?.longitude);

    if (latitude === null || longitude === null) {
      return null;
    }

    return { lat: latitude, lng: longitude };
  }

  const fallbackOrder = getFallbackOrder(orderId);
  const latitude = normalizeCoordinateValue(fallbackOrder?.driverLocation?.latitude);
  const longitude = normalizeCoordinateValue(fallbackOrder?.driverLocation?.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { lat: latitude, lng: longitude };
};

const emitDriverLocation = (io, orderId, driverLocation) => {
  io.to(`order:${orderId}`).emit('driver:location', driverLocation);
  io.to(`order:${orderId}`).emit('driver_location', driverLocation);
};

exports.registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('customer_room_join', (userId) => {
      socket.join(`customer:${userId}`);
    });

    socket.on('customer_room_leave', (userId) => {
      socket.leave(`customer:${userId}`);
    });

    socket.on('merchant_room_join', (restaurantId) => {
      if (restaurantId) {
        socket.join(`merchant:${restaurantId}`);
        return;
      }

      socket.join('merchants');
    });

    socket.on('driver_room_join', () => {
      socket.join('drivers');
    });

    const joinOrderRoom = async (orderId) => {
      if (!orderId) {
        return;
      }

      socket.join(`order:${orderId}`);
      const savedDriverLocation = await getSavedDriverLocation(String(orderId)).catch(() => null);

      if (savedDriverLocation) {
        socket.emit('driver:location', savedDriverLocation);
        socket.emit('driver_location', savedDriverLocation);
      }
    };

    socket.on('order_room_join', (orderId) => {
      void joinOrderRoom(orderId);
    });

    socket.on('join-order-room', (orderId) => {
      void joinOrderRoom(orderId);
    });

    socket.on('order_room_leave', (orderId) => {
      if (!orderId) {
        return;
      }

      socket.leave(`order:${orderId}`);
    });

    socket.on('leave-order-room', (orderId) => {
      if (!orderId) {
        return;
      }

      socket.leave(`order:${orderId}`);
    });

    socket.on('order_received', (payload) => {
      if (payload?.restaurantId) {
        io.to(`merchant:${payload.restaurantId}`).emit('order_received', payload);
        return;
      }

      io.to('merchants').emit('order_received', payload);
    });

    socket.on('order_status_changed', (payload) => {
      if (payload?.restaurantId) {
        io.to(`merchant:${payload.restaurantId}`).emit('order_status_changed', payload);
      } else {
        io.to('merchants').emit('order_status_changed', payload);
      }
      io.to(`customer:${payload.userId ?? 'guest'}`).emit(
        'push_notification',
        payload
      );
      io.to(`customer:${payload.userId ?? 'guest'}`).emit('order_status_changed', payload);
    });

    const handleDriverLocation = async (payload) => {
      const orderId = String(payload?.orderId ?? '');
      const driverLocation = normalizeLocation(payload?.location ?? payload);

      if (!orderId || !driverLocation) {
        return;
      }

      const savedDriverLocation = await saveDriverLocation(orderId, driverLocation).catch(() => null);

      if (!savedDriverLocation) {
        return;
      }

      emitDriverLocation(io, orderId, savedDriverLocation);
    };

    socket.on('driver_location', (payload) => {
      void handleDriverLocation(payload);
    });

    socket.on('driver:location', (payload) => {
      void handleDriverLocation(payload);
    });

    socket.on('driver_order_available', (payload) => {
      io.to('drivers').emit('driver_order_available', payload);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
