exports.registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('customer_room_join', (userId) => {
      socket.join(`customer:${userId}`);
    });

    socket.on('customer_room_leave', (userId) => {
      socket.leave(`customer:${userId}`);
    });

    socket.on('merchant_room_join', () => {
      socket.join('merchants');
    });

    socket.on('driver_room_join', () => {
      socket.join('drivers');
    });

    socket.on('order_room_join', (orderId) => {
      if (!orderId) {
        return;
      }

      socket.join(`order:${orderId}`);
    });

    socket.on('order_room_leave', (orderId) => {
      if (!orderId) {
        return;
      }

      socket.leave(`order:${orderId}`);
    });

    socket.on('order_received', (payload) => {
      io.to('merchants').emit('order_received', payload);
    });

    socket.on('order_status_changed', (payload) => {
      io.to(`customer:${payload.userId ?? 'guest'}`).emit(
        'push_notification',
        payload
      );
      io.to(`customer:${payload.userId ?? 'guest'}`).emit('order_status_changed', payload);
    });

    socket.on('driver_location', (payload) => {
      if (!payload?.orderId || !payload?.location) {
        return;
      }

      socket.to(`order:${payload.orderId}`).emit('driver_location', payload.location);
    });

    socket.on('driver_order_available', (payload) => {
      io.to('drivers').emit('driver_order_available', payload);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
