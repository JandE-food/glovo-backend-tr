const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    ad: {
      type: String,
      required: true
    },
    aciklama: {
      type: String,
      default: ''
    },
    fiyat: {
      type: Number,
      required: true
    },
    kategori: {
      type: String,
      default: 'genel'
    },
    stoktaVar: {
      type: Boolean,
      default: true
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    _id: false
  }
);

const restaurantSchema = new mongoose.Schema(
  {
    ad: {
      type: String,
      required: true
    },
    aciklama: {
      type: String,
      default: ''
    },
    puan: {
      type: Number,
      default: 0
    },
    teslimatSuresi: {
      type: String,
      default: '20-35 dk'
    },
    kategori: {
      type: String,
      default: 'restoran'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    ownerUserId: {
      type: String,
      default: ''
    },
    ownerEmail: {
      type: String,
      default: '',
      index: true
    },
    menu: {
      type: [menuSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Restaurant =
  mongoose.models.Restaurant ?? mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
