const express = require('express');
const mongoose = require('mongoose');

const Restaurant = require('../models/Restaurant.js');
const { isFallbackId } = require('../utils/idHelpers.js');

const router = express.Router();

const fallbackRestaurants = [
  {
    id: 'r1',
    ad: 'Blloku Trilece House',
    aciklama: 'Embelsira furre dhe trilece e fresket',
    puan: 4.8,
    teslimatSuresi: '15-30 min',
    kategori: 'desserts',
    menu: [
      {
        id: 'm1',
        ad: 'Kunefe',
        aciklama: 'Trilece e bute me karamel',
        fiyat: 380,
        kategori: 'desserts',
        stoktaVar: true
      }
    ]
  },
  {
    id: 'r2',
    ad: 'Komuna Tave & Byrek',
    aciklama: 'Tave kosi e ngrohte dhe byrek i pjekur',
    puan: 4.7,
    teslimatSuresi: '20-35 min',
    kategori: 'pide',
    menu: [
      {
        id: 'm2',
        ad: 'Tave Kosi',
        aciklama: 'Tave kosi me mish qengji dhe kos',
        fiyat: 550,
        kategori: 'pide',
        stoktaVar: true
      },
      {
        id: 'm3',
        ad: 'Byrek',
        aciklama: 'Byrek i fresket i pergatitur cdo dite',
        fiyat: 180,
        kategori: 'kahvalti',
        stoktaVar: true
      }
    ]
  }
];

const normalizeCategory = (value) =>
  String(value ?? '')
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');

router.get('/', async (request, response) => {
  const category = request.query.category ? String(request.query.category) : undefined;
  const normalizedCategory = category ? normalizeCategory(category) : '';

  if (mongoose.connection.readyState === 1) {
    const restoranlar = await Restaurant.find().sort({ createdAt: -1 }).lean();
    const filteredRestaurants = normalizedCategory
      ? restoranlar.filter(
          (restoran) => normalizeCategory(restoran.kategori) === normalizedCategory
        )
      : restoranlar;

    response.json({
      restaurants: filteredRestaurants
    });
    return;
  }

  const filteredRestaurants = normalizedCategory
    ? fallbackRestaurants.filter(
        (restoran) => normalizeCategory(restoran.kategori) === normalizedCategory
      )
    : fallbackRestaurants;

  response.json({
    restaurants: filteredRestaurants
  });
});

router.get('/:restaurantId', async (request, response) => {
  const { restaurantId } = request.params;

  if (mongoose.connection.readyState === 1) {
    // Check if restaurantId is a fallback ID
    // If it is, we can't use findById() as it's not a valid ObjectId
    if (isFallbackId(restaurantId)) {
      // For fallback IDs, return 404 since they don't exist in MongoDB
      response.status(404).json({
        message: 'Restaurant not found'
      });
      return;
    }
    
    // Try to find by ObjectId
    const restoran = await Restaurant.findById(restaurantId).lean();

    if (!restoran) {
      response.status(404).json({
        message: 'Restaurant not found'
      });
      return;
    }

    response.json({
      restaurant: restoran
    });
    return;
  }

  const restoran = fallbackRestaurants.find((entry) => entry.id === restaurantId);

  if (!restoran) {
    response.status(404).json({
      message: 'Restaurant not found'
    });
    return;
  }

  response.json({
    restaurant: restoran
  });
});

module.exports = router;
