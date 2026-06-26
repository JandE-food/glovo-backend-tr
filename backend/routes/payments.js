const express = require('express');
const mongoose = require('mongoose');

const Order = require('../models/Order.js');
const ordersRouter = require('./orders.js');

const router = express.Router();

const TRANSACTION_FEE_ALL = 100;
const SUPPORTED_BANKS = [
  'BKT',
  'Raiffeisen Bank Albania',
  'Credins Bank',
  'OTP Bank Albania',
  'Union Bank'
];

const getFlutterwaveSecretKey = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  return key;
};

const getFlutterwaveBaseUrl = () => {
  const baseUrl = process.env.PAYSTACK_BASE_URL;
  if (baseUrl && String(baseUrl).trim().length > 0) {
    return String(baseUrl).replace(/\/+$/, '');
  }

  return 'https://api.flutterwave.com';
};

const mapGatewayCurrency = (currency) => {
  const normalized = String(currency ?? '').toUpperCase();
  return normalized === 'ALL' ? 'USD' : normalized;
};

const validateInitPayload = (payload) => {
  if (typeof payload.amount !== 'number' || Number.isNaN(payload.amount) || payload.amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (!payload.orderId) {
    throw new Error('orderId is required');
  }

  if (!payload.email) {
    throw new Error('email is required');
  }
};

const validateVerifyPayload = (payload) => {
  if (!payload.orderId) {
    throw new Error('orderId is required');
  }

  if (!payload.txRef) {
    throw new Error('txRef is required');
  }
};

const createHostedCheckout = async (payload) => {
  const secretKey = getFlutterwaveSecretKey();
  const baseUrl = getFlutterwaveBaseUrl();
  validateInitPayload(payload);

  const baseAmount = payload.amount;
  const totalAmount = baseAmount + TRANSACTION_FEE_ALL;
  const txRef = `cabuk_${payload.orderId}_${Date.now()}`;
  const currency = mapGatewayCurrency(payload.currency ?? 'ALL');
  const redirectUrl = String(payload.redirectUrl ?? 'cabuk://checkout');

  const response = await fetch(`${baseUrl}/v3/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: totalAmount,
      currency,
      redirect_url: redirectUrl,
      customer: {
        email: String(payload.email)
      },
      meta: {
        orderId: String(payload.orderId),
        baseAmountAll: baseAmount.toFixed(2),
        transactionFeeAll: TRANSACTION_FEE_ALL.toFixed(2),
        requestedPaymentMethod: payload.paymentMethod ?? 'card'
      },
      customizations: {
        title: 'Cabuk Checkout'
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? 'Flutterwave payment initialization failed');
  }

  return {
    txRef,
    checkoutUrl: data?.data?.link
  };
};

const verifyHostedCheckout = async (txRef) => {
  const secretKey = getFlutterwaveSecretKey();
  const baseUrl = getFlutterwaveBaseUrl();
  const response = await fetch(
    `${baseUrl}/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? 'Flutterwave payment could not be verified');
  }

  return data?.data;
};

const markOrderPaid = async (orderId, paymentIntentId, io) => {
  if (mongoose.connection.readyState === 1) {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        paymentTransactionId: paymentIntentId
      },
      { new: true }
    );

    if (!updatedOrder) {
      throw new Error('Order not found');
    }

    if (typeof ordersRouter.emitStatusChanged === 'function') {
      ordersRouter.emitStatusChanged(io, updatedOrder);
    }

    if (typeof ordersRouter.emitOrderReceived === 'function') {
      ordersRouter.emitOrderReceived(io, updatedOrder);
    }

    return updatedOrder;
  }

  const fallbackOrders = ordersRouter.fallbackOrders ?? [];
  const fallbackOrderIndex = fallbackOrders.findIndex((entry) => entry.id === orderId);

  if (fallbackOrderIndex === -1) {
    throw new Error('Order not found');
  }

  fallbackOrders[fallbackOrderIndex] = {
    ...fallbackOrders[fallbackOrderIndex],
    paymentStatus: 'paid',
    paymentTransactionId: paymentIntentId
  };

  if (typeof ordersRouter.emitStatusChanged === 'function') {
    ordersRouter.emitStatusChanged(io, fallbackOrders[fallbackOrderIndex]);
  }

  if (typeof ordersRouter.emitOrderReceived === 'function') {
    ordersRouter.emitOrderReceived(io, fallbackOrders[fallbackOrderIndex]);
  }

  return fallbackOrders[fallbackOrderIndex];
};

router.post('/paystack', async (request, response) => {
  try {
    const payload = request.body ?? {};
    const io = request.app.get('io');

    if (payload.action === 'verify_payment') {
      validateVerifyPayload(payload);
      const verified = await verifyHostedCheckout(payload.txRef);

      if (String(verified?.status ?? '').toLowerCase() !== 'successful') {
        response.status(400).json({
          success: false,
          transactionId: String(verified?.id ?? ''),
          txRef: payload.txRef,
          message: 'Error: Payment failed',
          transactionFeeAll: TRANSACTION_FEE_ALL,
          supportedBanks: SUPPORTED_BANKS
        });
        return;
      }

      const transactionId = String(verified?.id ?? payload.txRef);
      await markOrderPaid(payload.orderId, transactionId, io);

      response.status(200).json({
        success: true,
        transactionId,
        txRef: payload.txRef,
        paymentMethod: payload.paymentMethod ?? 'card',
        transactionFeeAll: TRANSACTION_FEE_ALL,
        supportedBanks: SUPPORTED_BANKS,
        amountChargedAll: Number(verified?.charged_amount ?? 0)
      });
      return;
    }

    const hosted = await createHostedCheckout(payload);

    if (!hosted.checkoutUrl) {
      throw new Error('Flutterwave checkout link was not returned');
    }

    response.status(201).json({
      success: true,
      transactionId: hosted.txRef,
      txRef: hosted.txRef,
      checkoutUrl: hosted.checkoutUrl,
      paymentMethod: payload.paymentMethod ?? 'card',
      transactionFeeAll: TRANSACTION_FEE_ALL,
      supportedBanks: SUPPORTED_BANKS,
      amountChargedAll: payload.amount + TRANSACTION_FEE_ALL
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error: Payment failed';

    response.status(400).json({
      success: false,
      transactionId: '',
      message,
      transactionFeeAll: TRANSACTION_FEE_ALL,
      supportedBanks: SUPPORTED_BANKS
    });
  }
});

module.exports = router;
