const express = require('express');
const mongoose = require('mongoose');

const Restaurant = require('../models/Restaurant.js');
const { isFallbackId } = require('../utils/idHelpers.js');

const router = express.Router();

const buildRestaurantImage = (restaurantName) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `realistic restaurant storefront for ${restaurantName || 'Cabuk restaurant'}, welcoming dining exterior, delivery app listing photo, professional photography`
  )}&image_size=landscape_16_9`;

const buildMenuItemImage = (itemName) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `realistic ${itemName || 'restaurant dish'} plated for a food delivery app menu, appetizing presentation, natural lighting, professional food photography`
  )}&image_size=square_hd`;

const createDefaultMerchantMenu = () => [
  {
    id: `m-${Date.now()}-1`,
    ad: 'Byrek',
    aciklama: 'Fresh baked pastry prepared daily with flaky layers.',
    fiyat: 12,
    kategori: 'Bakery',
    stoktaVar: true,
    imageUrl: buildMenuItemImage('Byrek')
  },
  {
    id: `m-${Date.now()}-2`,
    ad: 'Tave Kosi',
    aciklama: 'Signature baked lamb and yogurt dish.',
    fiyat: 18,
    kategori: 'Main Dish',
    stoktaVar: true,
    imageUrl: buildMenuItemImage('Tave Kosi')
  },
  {
    id: `m-${Date.now()}-3`,
    ad: 'Trilece',
    aciklama: 'Creamy dessert finished for ready-to-serve orders.',
    fiyat: 11,
    kategori: 'Dessert',
    stoktaVar: true,
    imageUrl: buildMenuItemImage('Trilece')
  }
];

const normalizeText = (value, fallback = '') => String(value ?? fallback).trim();

const normalizeMenuItem = (item, index = 0) => ({
  id: normalizeText(item.id, `m-${Date.now()}-${index + 1}`),
  ad: normalizeText(item.ad ?? item.name, `Menu Item ${index + 1}`),
  aciklama: normalizeText(item.aciklama ?? item.description),
  fiyat: Number(item.fiyat ?? item.price ?? 0),
  kategori: normalizeText(item.kategori ?? item.category, 'genel'),
  stoktaVar: Boolean(item.stoktaVar ?? item.inStock ?? true),
  imageUrl: normalizeText(item.imageUrl ?? item.image, buildMenuItemImage(item.ad ?? item.name)),
});

const normalizeRestaurantRecord = (restaurant) => ({
  ...restaurant,
  ownerUserId: normalizeText(restaurant.ownerUserId),
  ownerEmail: normalizeText(restaurant.ownerEmail).toLocaleLowerCase('en-US'),
  imageUrl: normalizeText(restaurant.imageUrl, buildRestaurantImage(restaurant.ad)),
  menu: Array.isArray(restaurant.menu) ? restaurant.menu.map(normalizeMenuItem) : []
});

const serializeRestaurantForPublic = (restaurant) => ({
  ...restaurant,
  menu: Array.isArray(restaurant.menu)
    ? restaurant.menu.filter((item) => item.stoktaVar !== false)
    : []
});

const fallbackRestaurants = [
  {
    id: 'r1',
    ad: 'Blloku Trilece House',
    aciklama: 'Embelsira furre dhe trilece e fresket',
    puan: 4.8,
    teslimatSuresi: '15-30 min',
    kategori: 'desserts',
    imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=realistic%20Albanian%20dessert%20restaurant%20in%20Tirana%2C%20trilece%20and%20bakery%20display%2C%20cozy%20evening%20lighting%2C%20professional%20food%20photography&image_size=landscape_16_9',
    menu: [
      {
        id: 'm1',
        ad: 'Kunefe',
        aciklama: 'Trilece e bute me karamel',
        fiyat: 380,
        kategori: 'desserts',
        stoktaVar: true,
        imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=realistic%20slice%20of%20trilece%20dessert%20with%20caramel%20glaze%2C%20soft%20milk%20cake%2C%20elegant%20dessert%20plate%2C%20professional%20food%20photography&image_size=square_hd'
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
    imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Albanian%20restaurant%20counter%20with%20freshly%20baked%20tave%20kosi%20and%20savory%20pastries%2C%20Tirana%20food%20style%2C%20realistic%20food%20photo&image_size=landscape_16_9',
    menu: [
      {
        id: 'm2',
        ad: 'Tave Kosi',
        aciklama: 'Tave kosi me mish qengji dhe kos',
        fiyat: 550,
        kategori: 'pide',
        stoktaVar: true,
        imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=realistic%20tave%20kosi%20served%20hot%20in%20a%20baked%20dish%2C%20Albanian%20comfort%20food%2C%20creamy%20yogurt%20top%2C%20restaurant%20table%2C%20professional%20food%20photo&image_size=square_hd'
      },
      {
        id: 'm3',
        ad: 'Byrek',
        aciklama: 'Byrek i fresket i pergatitur cdo dite',
        fiyat: 180,
        kategori: 'kahvalti',
        stoktaVar: true,
        imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=realistic%20freshly%20baked%20Albanian%20byrek%20pastry%20on%20a%20ceramic%20plate%2C%20crispy%20golden%20layers%2C%20warm%20restaurant%20lighting%2C%20professional%20food%20photography&image_size=square_hd'
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

const findFallbackRestaurantByOwnerEmail = (ownerEmail) =>
  fallbackRestaurants.find(
    (restaurant) => normalizeText(restaurant.ownerEmail).toLocaleLowerCase('en-US') === normalizeText(ownerEmail).toLocaleLowerCase('en-US')
  );

const buildMerchantRestaurantPayload = (payload) =>
  normalizeRestaurantRecord({
    id: payload.id ?? `restaurant-${Date.now()}`,
    ad: normalizeText(payload.ad, 'Cabuk Restaurant'),
    aciklama: normalizeText(payload.aciklama, 'Fresh menu items available for delivery.'),
    puan: Number(payload.puan ?? 4.8),
    teslimatSuresi: normalizeText(payload.teslimatSuresi, '20-35 min'),
    kategori: normalizeText(payload.kategori, 'restaurants'),
    imageUrl: normalizeText(payload.imageUrl, buildRestaurantImage(payload.ad)),
    ownerUserId: normalizeText(payload.ownerUserId),
    ownerEmail: normalizeText(payload.ownerEmail).toLocaleLowerCase('en-US'),
    menu:
      Array.isArray(payload.menu) && payload.menu.length > 0
        ? payload.menu.map(normalizeMenuItem)
        : createDefaultMerchantMenu()
  });

const ensureMerchantRestaurant = async (payload) => {
  const restaurantData = buildMerchantRestaurantPayload(payload);

  if (mongoose.connection.readyState === 1) {
    const existingRestaurant = await Restaurant.findOne({
      ownerEmail: restaurantData.ownerEmail
    });

    if (existingRestaurant) {
      existingRestaurant.ad = existingRestaurant.ad || restaurantData.ad;
      existingRestaurant.aciklama = existingRestaurant.aciklama || restaurantData.aciklama;
      existingRestaurant.kategori = existingRestaurant.kategori || restaurantData.kategori;
      existingRestaurant.teslimatSuresi = existingRestaurant.teslimatSuresi || restaurantData.teslimatSuresi;
      existingRestaurant.imageUrl = existingRestaurant.imageUrl || restaurantData.imageUrl;
      existingRestaurant.ownerUserId = restaurantData.ownerUserId || existingRestaurant.ownerUserId;
      if (!Array.isArray(existingRestaurant.menu) || existingRestaurant.menu.length === 0) {
        existingRestaurant.menu = restaurantData.menu;
      }
      await existingRestaurant.save();
      return existingRestaurant.toObject();
    }

    const createdRestaurant = await Restaurant.create(restaurantData);
    return createdRestaurant.toObject();
  }

  const fallbackRestaurant = findFallbackRestaurantByOwnerEmail(restaurantData.ownerEmail);
  if (fallbackRestaurant) {
    Object.assign(fallbackRestaurant, {
      ...fallbackRestaurant,
      ownerUserId: restaurantData.ownerUserId || fallbackRestaurant.ownerUserId,
      ad: fallbackRestaurant.ad || restaurantData.ad,
      imageUrl: fallbackRestaurant.imageUrl || restaurantData.imageUrl
    });
    if (!Array.isArray(fallbackRestaurant.menu) || fallbackRestaurant.menu.length === 0) {
      fallbackRestaurant.menu = restaurantData.menu;
    }
    return normalizeRestaurantRecord(fallbackRestaurant);
  }

  fallbackRestaurants.unshift(restaurantData);
  return restaurantData;
};

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
      restaurants: filteredRestaurants.map(serializeRestaurantForPublic)
    });
    return;
  }

  const filteredRestaurants = normalizedCategory
    ? fallbackRestaurants.filter(
        (restoran) => normalizeCategory(restoran.kategori) === normalizedCategory
      )
    : fallbackRestaurants;

  response.json({
    restaurants: filteredRestaurants.map(serializeRestaurantForPublic)
  });
});

router.get('/owner-profile', async (request, response) => {
  const ownerEmail = normalizeText(request.query.ownerEmail).toLocaleLowerCase('en-US');

  if (!ownerEmail) {
    response.status(400).json({
      message: 'ownerEmail is required'
    });
    return;
  }

  if (mongoose.connection.readyState === 1) {
    const restaurant = await Restaurant.findOne({ ownerEmail }).lean();

    if (!restaurant) {
      response.status(404).json({
        message: 'Restaurant not found'
      });
      return;
    }

    response.json({ restaurant: normalizeRestaurantRecord(restaurant) });
    return;
  }

  const restaurant = findFallbackRestaurantByOwnerEmail(ownerEmail);

  if (!restaurant) {
    response.status(404).json({
      message: 'Restaurant not found'
    });
    return;
  }

  response.json({ restaurant: normalizeRestaurantRecord(restaurant) });
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
      restaurant: serializeRestaurantForPublic(normalizeRestaurantRecord(restoran))
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
    restaurant: serializeRestaurantForPublic(normalizeRestaurantRecord(restoran))
  });
});

router.patch('/:restaurantId/profile', async (request, response) => {
  const { restaurantId } = request.params;
  const ownerEmail = normalizeText(request.body?.ownerEmail ?? request.query.ownerEmail).toLocaleLowerCase('en-US');
  const updates = {
    ad: normalizeText(request.body?.ad),
    aciklama: normalizeText(request.body?.aciklama),
    imageUrl: normalizeText(request.body?.imageUrl),
    kategori: normalizeText(request.body?.kategori),
    teslimatSuresi: normalizeText(request.body?.teslimatSuresi)
  };

  if (mongoose.connection.readyState === 1) {
    if (isFallbackId(restaurantId)) {
      response.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      response.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    if (ownerEmail && restaurant.ownerEmail && restaurant.ownerEmail !== ownerEmail) {
      response.status(403).json({ message: 'Restaurant access denied' });
      return;
    }

    restaurant.ad = updates.ad || restaurant.ad;
    restaurant.aciklama = updates.aciklama || restaurant.aciklama;
    restaurant.imageUrl = updates.imageUrl || restaurant.imageUrl;
    restaurant.kategori = updates.kategori || restaurant.kategori;
    restaurant.teslimatSuresi = updates.teslimatSuresi || restaurant.teslimatSuresi;
    await restaurant.save();

    response.json({ restaurant: normalizeRestaurantRecord(restaurant.toObject()) });
    return;
  }

  const restaurant = fallbackRestaurants.find((entry) => entry.id === restaurantId);
  if (!restaurant) {
    response.status(404).json({ message: 'Restaurant not found' });
    return;
  }

  if (ownerEmail && restaurant.ownerEmail && restaurant.ownerEmail !== ownerEmail) {
    response.status(403).json({ message: 'Restaurant access denied' });
    return;
  }

  Object.assign(restaurant, {
    ad: updates.ad || restaurant.ad,
    aciklama: updates.aciklama || restaurant.aciklama,
    imageUrl: updates.imageUrl || restaurant.imageUrl,
    kategori: updates.kategori || restaurant.kategori,
    teslimatSuresi: updates.teslimatSuresi || restaurant.teslimatSuresi
  });

  response.json({ restaurant: normalizeRestaurantRecord(restaurant) });
});

router.put('/:restaurantId/menu', async (request, response) => {
  const { restaurantId } = request.params;
  const ownerEmail = normalizeText(request.body?.ownerEmail ?? request.query.ownerEmail).toLocaleLowerCase('en-US');
  const nextMenu = Array.isArray(request.body?.menu) ? request.body.menu.map(normalizeMenuItem) : [];

  if (mongoose.connection.readyState === 1) {
    if (isFallbackId(restaurantId)) {
      response.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      response.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    if (ownerEmail && restaurant.ownerEmail && restaurant.ownerEmail !== ownerEmail) {
      response.status(403).json({ message: 'Restaurant access denied' });
      return;
    }

    restaurant.menu = nextMenu;
    await restaurant.save();

    response.json({ restaurant: normalizeRestaurantRecord(restaurant.toObject()) });
    return;
  }

  const restaurant = fallbackRestaurants.find((entry) => entry.id === restaurantId);
  if (!restaurant) {
    response.status(404).json({ message: 'Restaurant not found' });
    return;
  }

  if (ownerEmail && restaurant.ownerEmail && restaurant.ownerEmail !== ownerEmail) {
    response.status(403).json({ message: 'Restaurant access denied' });
    return;
  }

  restaurant.menu = nextMenu;
  response.json({ restaurant: normalizeRestaurantRecord(restaurant) });
});

router.fallbackRestaurants = fallbackRestaurants;
router.ensureMerchantRestaurant = ensureMerchantRestaurant;

module.exports = router;
