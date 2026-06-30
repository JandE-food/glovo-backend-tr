const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    adSoyad: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    sifre: {
      type: String,
      required: true
    },
    telefon: {
      type: String,
      default: ''
    },
    rol: {
      type: String,
      enum: ['customer', 'driver', 'merchant', 'admin'],
      default: 'customer'
    },
    restaurantId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const User = mongoose.models.User ?? mongoose.model('User', userSchema);

module.exports = User;
