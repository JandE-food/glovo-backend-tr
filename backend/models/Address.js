const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    mahalle: {
      type: String,
      required: true
    },
    sokak: {
      type: String,
      default: ''
    },
    apartmanNo: {
      type: String,
      default: ''
    },
    kat: {
      type: String,
      default: ''
    },
    daire: {
      type: String,
      default: ''
    },
    postaKodu: {
      type: String,
      required: true,
      match: /^\d{5}$/
    },
    ilce: {
      type: String,
      required: true
    },
    il: {
      type: String,
      default: 'Tirane'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Address = mongoose.models.Address ?? mongoose.model('Address', addressSchema);

module.exports = Address;
