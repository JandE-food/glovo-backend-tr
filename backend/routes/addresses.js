const express = require('express');
const mongoose = require('mongoose');

const Address = require('../models/Address.js');
const { isFallbackId } = require('../utils/idHelpers.js');

const router = express.Router();

const normalizeCoordinateValue = (value) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : null;
};

const fallbackAddresses = [
  {
    id: 'address-1',
    userId: 'user-1',
    mahalle: 'Blloku',
    sokak: 'Rruga Ibrahim Rugova',
    apartmanNo: '12',
    kat: '2',
    daire: '5',
    postaKodu: '1001',
    ilce: 'Blloku',
    il: 'Tirane',
    latitude: 41.3194,
    longitude: 19.8156,
    isDefault: true
  }
];

const getUserAddresses = (userId) =>
  fallbackAddresses.filter((address) => address.userId === userId);

const getAddressesHandler = async (request, response) => {
  const userId = String(request.params.userId ?? request.query.userId ?? 'user-1');

  if (mongoose.connection.readyState === 1) {
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 }).lean();

    response.json({ addresses });
    return;
  }

  response.json({
    addresses: getUserAddresses(userId)
  });
};

router.get('/', getAddressesHandler);
router.get('/:userId', getAddressesHandler);

router.post('/', async (request, response) => {
  const payload = request.body ?? {};

  if (!payload.mahalle) {
    response.status(400).json({ message: 'Neighborhood selection is required' });
    return;
  }

  if (!/^\d{5}$/.test(String(payload.postaKodu ?? ''))) {
    response.status(400).json({ message: 'Postal code must be 5 digits' });
    return;
  }

  const addressData = {
    userId: String(payload.userId ?? 'user-1'),
    mahalle: payload.mahalle,
    sokak: payload.sokak ?? '',
    apartmanNo: payload.apartmanNo ?? '',
    kat: payload.kat ?? '',
    daire: payload.daire ?? '',
    postaKodu: payload.postaKodu,
    ilce: payload.ilce ?? payload.mahalle,
    il: payload.il ?? 'Tirane',
    latitude: normalizeCoordinateValue(payload.latitude ?? payload.lat),
    longitude: normalizeCoordinateValue(payload.longitude ?? payload.lng),
    isDefault: Boolean(payload.isDefault)
  };

  if (mongoose.connection.readyState === 1) {
    if (addressData.isDefault) {
      await Address.updateMany(
        { userId: addressData.userId },
        { isDefault: false }
      );
    }

    const address = await Address.create(addressData);

    response.status(201).json({
      message: 'Address saved',
      address
    });
    return;
  }

  if (addressData.isDefault) {
    for (const address of fallbackAddresses) {
      if (address.userId === addressData.userId) {
        address.isDefault = false;
      }
    }
  }

  const address = {
    id: `address-${Date.now()}`,
    ...addressData
  };

  fallbackAddresses.unshift(address);

  response.status(201).json({
    message: 'Address saved',
    address
  });
});

router.patch('/:addressId', async (request, response) => {
  const payload = request.body ?? {};
  const { addressId } = request.params;

  if (!payload.mahalle) {
    response.status(400).json({ message: 'Neighborhood selection is required' });
    return;
  }

  if (!/^\d{5}$/.test(String(payload.postaKodu ?? ''))) {
    response.status(400).json({ message: 'Postal code must be 5 digits' });
    return;
  }

  if (mongoose.connection.readyState === 1) {
    // Check if addressId is a fallback ID
    if (isFallbackId(addressId)) {
      response.status(404).json({ message: 'Address not found' });
      return;
    }

    const mevcutAdres = await Address.findById(addressId);

    if (!mevcutAdres) {
      response.status(404).json({ message: 'Address not found' });
      return;
    }

    if (payload.isDefault) {
      await Address.updateMany(
        { userId: mevcutAdres.userId },
        { isDefault: false }
      );
    }

    const address = await Address.findByIdAndUpdate(
      addressId,
      {
        ...payload,
        ilce: payload.ilce ?? payload.mahalle,
        il: payload.il ?? 'Tirane',
        latitude: normalizeCoordinateValue(payload.latitude ?? payload.lat),
        longitude: normalizeCoordinateValue(payload.longitude ?? payload.lng)
      },
      { new: true }
    );

    response.json({
      message: 'Address updated',
      address
    });
    return;
  }

  const addressIndex = fallbackAddresses.findIndex((entry) => entry.id === addressId);

  if (addressIndex === -1) {
    response.status(404).json({ message: 'Address not found' });
    return;
  }

  if (payload.isDefault) {
    for (const address of fallbackAddresses) {
      if (address.userId === fallbackAddresses[addressIndex].userId) {
        address.isDefault = false;
      }
    }
  }

  fallbackAddresses[addressIndex] = {
    ...fallbackAddresses[addressIndex],
    ...payload,
    ilce: payload.ilce ?? payload.mahalle,
    il: payload.il ?? 'Tirane',
    latitude: normalizeCoordinateValue(payload.latitude ?? payload.lat),
    longitude: normalizeCoordinateValue(payload.longitude ?? payload.lng)
  };

  response.json({
    message: 'Address updated',
    address: fallbackAddresses[addressIndex]
  });
});

router.delete('/:addressId', async (request, response) => {
  const { addressId } = request.params;
  const userId = String(request.query.userId ?? 'user-1');

  if (mongoose.connection.readyState === 1) {
    const silinenAdres = await Address.findOneAndDelete({
      _id: addressId,
      userId
    });

    if (!silinenAdres) {
      response.status(404).json({ message: 'Address not found' });
      return;
    }

    if (silinenAdres.isDefault) {
      const yeniVarsayilan = await Address.findOne({ userId }).sort({ createdAt: -1 });

      if (yeniVarsayilan) {
        yeniVarsayilan.isDefault = true;
        await yeniVarsayilan.save();
      }
    }

    response.json({
      message: 'Address deleted',
      deletedId: addressId
    });
    return;
  }

  const addressIndex = fallbackAddresses.findIndex(
    (entry) => entry.id === addressId && entry.userId === userId
  );

  if (addressIndex === -1) {
    response.status(404).json({ message: 'Address not found' });
    return;
  }

  const [silinenAdres] = fallbackAddresses.splice(addressIndex, 1);

  if (silinenAdres.isDefault) {
    const yeniVarsayilan = fallbackAddresses.find((entry) => entry.userId === userId);

    if (yeniVarsayilan) {
      yeniVarsayilan.isDefault = true;
    }
  }

  response.json({
    message: 'Address deleted',
    deletedId: addressId
  });
});

module.exports = router;
