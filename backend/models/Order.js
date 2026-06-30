const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const coordinateSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    restaurantId: {
      type: String,
      default: ''
    },
    items: {
      type: [orderItemSchema],
      default: []
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'qr'],
      default: 'card'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid'
    },
    paymentTransactionId: {
      type: String,
      default: ''
    },
    deliveryAddress: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    deliveryLocation: {
      type: coordinateSchema,
      default: null
    },
    driverLocation: {
      type: coordinateSchema,
      default: null
    },
    assignedDriverId: {
      type: String,
      default: ''
    },
    assignedDriverName: {
      type: String,
      default: ''
    },
    assignedDriverAvatar: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'received',
        'preparing',
        'ready',
        'approaching',
        'at_door',
        'delivered',
        'cancelled'
      ],
      default: 'received'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Order = mongoose.models.Order ?? mongoose.model('Order', orderSchema);

module.exports = Order;
