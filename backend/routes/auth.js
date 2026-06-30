const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/User.js');
const restaurantsRouter = require('./restaurants.js');

const router = express.Router();

const normalizeEmail = (value) =>
  String(value ?? '').trim().toLocaleLowerCase('en-US');

const demoMerchantUser = {
  id: 'merchant-demo',
  adSoyad: 'Cabuk Merchant',
  email: 'merchant@cabuk.al',
  sifre: '123456',
  telefon: '',
  rol: 'merchant'
};

const fallbackUsers = [demoMerchantUser];

const createToken = (user) =>
  jwt.sign(
    {
      userId: user.id ?? user._id?.toString(),
      email: user.email,
      rol: user.rol
    },
    process.env.JWT_SECRET ?? 'cabuk_albania_secret',
    {
      expiresIn: '7d'
    }
  );

const getSignupPayload = (body = {}) => ({
  adSoyad: body.adSoyad ?? body.name,
  email: normalizeEmail(body.email),
  sifre: body.sifre ?? body.password,
  telefon: body.telefon ?? body.phone,
  rol: body.rol ?? body.role ?? body.userType,
  restaurantName: body.restaurantName,
  restaurantImageUrl: body.restaurantImageUrl,
  restaurantType: body.restaurantType
});

const buildAuthUserResponse = (user, restaurant) => ({
  ...user,
  restaurantId: restaurant?.id ?? restaurant?._id?.toString?.() ?? user.restaurantId ?? '',
  restaurantName: restaurant?.ad ?? user.restaurantName ?? '',
  restaurantImageUrl: restaurant?.imageUrl ?? user.restaurantImageUrl ?? '',
  restaurantType: restaurant?.kategori ?? user.restaurantType ?? 'restaurants'
});

const signupHandler = async (request, response) => {
  const { adSoyad, email, sifre, telefon, rol, restaurantName, restaurantImageUrl, restaurantType } = getSignupPayload(request.body ?? {});
  const requestedRole = String(rol ?? 'customer').toLocaleLowerCase('en-US');
  const allowedRoles = ['customer', 'driver', 'merchant'];

  if (!adSoyad || !email || !sifre) {
    response.status(400).json({
      message: 'Full name, email, and password are required'
    });
    return;
  }

  if (!allowedRoles.includes(requestedRole)) {
    response.status(400).json({
      message: 'Invalid user role'
    });
    return;
  }

  if (mongoose.connection.readyState === 1) {
    const mevcutKullanici = await User.findOne({ email });

    if (mevcutKullanici) {
      response.status(409).json({
        message: 'An account already exists with this email'
      });
      return;
    }

    try {
      const kullanici = await User.create({
        adSoyad,
        email,
        sifre,
        telefon,
        rol: requestedRole
      });
      let restaurant = null;

      if (requestedRole === 'merchant') {
        restaurant = await restaurantsRouter.ensureMerchantRestaurant({
          ad: restaurantName?.trim() || `${adSoyad.split(' ')[0] || 'Cabuk'} Kitchen`,
          ownerEmail: email,
          ownerUserId: kullanici._id.toString(),
          imageUrl: restaurantImageUrl,
          kategori: restaurantType
        });
        kullanici.restaurantId = restaurant.id ?? restaurant._id?.toString?.() ?? '';
        await kullanici.save();
      }
      const token = createToken(kullanici);

      response.status(201).json({
        message: 'User account created',
        token,
        user: buildAuthUserResponse(kullanici.toObject(), restaurant)
      });
      return;
    } catch (error) {
      if (error && (error.code === 11000 || String(error.message ?? '').includes('E11000'))) {
        response.status(409).json({
          message: 'An account already exists with this email'
        });
        return;
      }

      throw error;
    }
  }

  const mevcutKullanici = fallbackUsers.find((user) => normalizeEmail(user.email) === email);

  if (mevcutKullanici) {
    response.status(409).json({
      message: 'An account already exists with this email'
    });
    return;
  }

  const kullanici = {
    id: `user-${Date.now()}`,
    adSoyad,
    email,
    sifre,
    telefon: telefon ?? '',
    rol: requestedRole,
    restaurantId: ''
  };

  let restaurant = null;

  if (requestedRole === 'merchant') {
    restaurant = await restaurantsRouter.ensureMerchantRestaurant({
      ad: restaurantName?.trim() || `${adSoyad.split(' ')[0] || 'Cabuk'} Kitchen`,
      ownerEmail: email,
      ownerUserId: kullanici.id,
      imageUrl: restaurantImageUrl,
      kategori: restaurantType
    });
    kullanici.restaurantId = restaurant.id ?? '';
  }

  fallbackUsers.unshift(kullanici);

  response.status(201).json({
    message: 'User account created',
    token: createToken(kullanici),
    user: buildAuthUserResponse(kullanici, restaurant)
  });
};

const getLoginPayload = (body = {}) => ({
  email: normalizeEmail(body.email),
  sifre: body.sifre ?? body.password
});

const findDemoMerchant = (email, sifre) => {
  if (
    normalizeEmail(email) === demoMerchantUser.email &&
    sifre === demoMerchantUser.sifre
  ) {
    return demoMerchantUser;
  }

  return null;
};

const loginHandler = async (request, response) => {
  const { email, sifre } = getLoginPayload(request.body ?? {});

  if (!email || !sifre) {
    response.status(400).json({
      message: 'Email and password are required'
    });
    return;
  }

  if (mongoose.connection.readyState === 1) {
    const kullanici = await User.findOne({ email });

    if (!kullanici || kullanici.sifre !== sifre) {
      const demoKullanici = findDemoMerchant(email, sifre);

      if (demoKullanici) {
        const restaurant = await restaurantsRouter.ensureMerchantRestaurant({
          ad: 'Maman Bistro',
          ownerEmail: demoKullanici.email,
          ownerUserId: demoKullanici.id,
          kategori: request.body?.restaurantType
        });
        response.json({
          message: 'Login successful',
          token: createToken(demoKullanici),
          user: buildAuthUserResponse(demoKullanici, restaurant)
        });
        return;
      }

      response.status(401).json({
        message: 'Email or password is incorrect'
      });
      return;
    }

    let restaurant = null;
    if (kullanici.rol === 'merchant') {
      restaurant = await restaurantsRouter.ensureMerchantRestaurant({
        ad: request.body?.restaurantName ?? 'Maman Bistro',
        ownerEmail: kullanici.email,
        ownerUserId: kullanici._id.toString(),
        kategori: request.body?.restaurantType
      });

      if (!kullanici.restaurantId) {
        kullanici.restaurantId = restaurant.id ?? restaurant._id?.toString?.() ?? '';
        await kullanici.save();
      }
    }

    response.json({
      message: 'Login successful',
      token: createToken(kullanici),
      user: buildAuthUserResponse(kullanici.toObject(), restaurant)
    });
    return;
  }

  const kullanici = fallbackUsers.find(
    (user) => normalizeEmail(user.email) === email && user.sifre === sifre
  );

  if (!kullanici) {
    response.status(401).json({
      message: 'Email or password is incorrect'
    });
    return;
  }

  let restaurant = null;
  if (kullanici.rol === 'merchant') {
    restaurant = await restaurantsRouter.ensureMerchantRestaurant({
      ad: kullanici.restaurantName ?? 'Maman Bistro',
      ownerEmail: kullanici.email,
      ownerUserId: kullanici.id,
      kategori: request.body?.restaurantType
    });
    kullanici.restaurantId = restaurant.id ?? '';
  }

  response.json({
    message: 'Login successful',
    token: createToken(kullanici),
    user: buildAuthUserResponse(kullanici, restaurant)
  });
};

router.post('/kayit-ol', signupHandler);
router.post('/signup', signupHandler);
router.post('/giris-yap', loginHandler);
router.post('/login', loginHandler);

module.exports = router;
