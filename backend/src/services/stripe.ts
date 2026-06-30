import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type StripePaymentMethod = 'card' | 'qr';

export type StripePaymentRequest = {
  amount: number;
  currency: 'GBP';
  paymentMethod: StripePaymentMethod;
};

const TRANSACTION_FEE_ALL = 100;
const ALBANIAN_BANKS = ['BKT', 'Raiffeisen Bank Albania', 'Credins Bank', 'OTP Bank Albania', 'Union Bank'] as const;
const DEFAULT_CURRENCY = 'GBP';
const stripeModuleName = 'stripe';

const toMinorUnits = (amount: number) => Math.round(amount * 100);

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envFilePath = path.resolve(currentDir, '../../.env');

const loadLocalEnv = () => {
  if (!existsSync(envFilePath)) {
    return;
  }

  const envContents = readFileSync(envFilePath, 'utf8');

  for (const line of envContents.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadLocalEnv();

const getStripeKey = () => {
  const stripeKey = process.env.STRIPE_KEY;

  if (!stripeKey) {
    throw new Error('STRIPE_KEY is not configured');
  }

  return stripeKey;
};

const validatePaymentRequest = (
  payload: Partial<StripePaymentRequest>,
): StripePaymentRequest => {
  if (typeof payload.amount !== 'number' || Number.isNaN(payload.amount) || payload.amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (payload.currency !== 'GBP') {
    throw new Error('Only GBP currency is supported');
  }

  if (payload.paymentMethod !== 'card' && payload.paymentMethod !== 'qr') {
    throw new Error('paymentMethod must be card or qr');
  }

  if (DEFAULT_CURRENCY !== 'GBP') {
    throw new Error('CURRENCY must be configured as GBP');
  }

  return {
    amount: payload.amount,
    currency: payload.currency,
    paymentMethod: payload.paymentMethod
  };
};

export const createStripePayment = async (payload: Partial<StripePaymentRequest>) => {
  const validatedPayload = validatePaymentRequest(payload);

  const stripeKey = getStripeKey();
  const totalAmountAll = validatedPayload.amount + TRANSACTION_FEE_ALL;
  const isQrPayment = validatedPayload.paymentMethod === 'qr';
  const requestBody = new URLSearchParams({
    amount: String(toMinorUnits(totalAmountAll)),
    currency: DEFAULT_CURRENCY.toLowerCase(),
    description: isQrPayment ? 'Cabuk Albanian QR payment' : 'Cabuk card payment',
    'metadata[baseAmountAll]': validatedPayload.amount.toFixed(2),
    'metadata[transactionFeeAll]': TRANSACTION_FEE_ALL.toFixed(2),
    'metadata[requestedPaymentMethod]': validatedPayload.paymentMethod,
    'metadata[qrNetwork]': isQrPayment ? 'albanian-national-qr' : 'not-applicable',
    'metadata[supportedBanks]': ALBANIAN_BANKS.join(', ')
  });

  // If the Stripe SDK is installed, use it. Otherwise fall back to Stripe's HTTP API.
  try {
    const stripeModule = (await import(stripeModuleName)) as {
      default: new (key: string) => {
        paymentIntents: {
          create: (input: {
            amount: number;
            currency: string;
            payment_method_types: string[];
            metadata: Record<string, string>;
            description: string;
          }) => Promise<{ id: string }>;
        };
      };
    };
    const stripe = new stripeModule.default(stripeKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toMinorUnits(totalAmountAll),
      currency: DEFAULT_CURRENCY.toLowerCase(),
      payment_method_types: ['card'],
      metadata: {
        baseAmountAll: validatedPayload.amount.toFixed(2),
        transactionFeeAll: TRANSACTION_FEE_ALL.toFixed(2),
        requestedPaymentMethod: validatedPayload.paymentMethod,
        qrNetwork: isQrPayment ? 'albanian-national-qr' : 'not-applicable',
        supportedBanks: ALBANIAN_BANKS.join(', ')
      },
      description: isQrPayment ? 'Cabuk Albanian QR payment' : 'Cabuk card payment'
    });

    return {
      success: Boolean(paymentIntent.id),
      transactionId: paymentIntent.id
    };
  } catch {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: requestBody
    });

    if (!response.ok) {
      const errorPayload = (await response.json()) as { error?: { message?: string } };

      throw new Error(errorPayload.error?.message ?? 'Stripe payment failed');
    }

    const paymentIntent = (await response.json()) as { id: string };

    return {
      success: Boolean(paymentIntent.id),
      transactionId: paymentIntent.id
    };
  }
};

export const stripeConfig = {
  transactionFeeAll: TRANSACTION_FEE_ALL,
  supportedBanks: [...ALBANIAN_BANKS]
};
