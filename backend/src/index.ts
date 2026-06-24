import cors from 'cors';
import express from 'express';

import { createStripePayment, stripeConfig } from './services/stripe.js';

type AddressPayload = {
  userId: string;
  mahalle: string;
  sokak: string;
  apartmanNo: string;
  kat: string;
  daire: string;
  postaKodu: string;
  isDefault: boolean;
};

type StoredAddress = AddressPayload & {
  id: string;
  ilce: string;
  il: string;
};

type PaymentPayload = {
  amount: number;
  currency: 'ALL';
  paymentMethod: 'card' | 'qr';
};

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

const addresses: StoredAddress[] = [
  {
    id: 'address-1',
    userId: 'user-1',
    mahalle: 'Blloku',
    ilce: 'Blloku',
    il: 'Tirane',
    sokak: 'Rruga Ibrahim Rugova',
    apartmanNo: '12',
    kat: '2',
    daire: '5',
    postaKodu: '1001',
    isDefault: true
  }
];

const getUserAddresses = (userId: string) =>
  addresses.filter((address) => address.userId === userId);

app.get('/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/payments/stripe', async (request, response) => {
  const payload = request.body as Partial<PaymentPayload>;

  try {
    const payment = await createStripePayment(payload);

    response.status(201).json(payment);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe payment failed';

    response.status(400).json({
      success: false,
      transactionId: '',
      message,
      transactionFeeAll: stripeConfig.transactionFeeAll,
      supportedBanks: stripeConfig.supportedBanks
    });
  }
});

app.get('/addresses', (request, response) => {
  const userId = String(request.query.userId ?? 'user-1');
  response.json({ addresses: getUserAddresses(userId) });
});

app.post('/addresses', (request, response) => {
  const payload = request.body as Partial<AddressPayload>;

  if (!payload.mahalle) {
    response.status(400).json({ message: 'Neighborhood selection is required' });
    return;
  }

  if (!/^\d{5}$/.test(payload.postaKodu ?? '')) {
    response.status(400).json({ message: 'Postal code must be 5 digits' });
    return;
  }

  const address: StoredAddress = {
    id: `address-${Date.now()}`,
    userId: payload.userId ?? 'user-1',
    mahalle: payload.mahalle,
    ilce: payload.mahalle,
    il: 'Tirane',
    sokak: payload.sokak ?? '',
    apartmanNo: payload.apartmanNo ?? '',
    kat: payload.kat ?? '',
    daire: payload.daire ?? '',
    postaKodu: payload.postaKodu ?? '',
    isDefault: Boolean(payload.isDefault),
  };

  if (address.isDefault) {
    for (const item of addresses) {
      if (item.userId === address.userId) {
        item.isDefault = false;
      }
    }
  }

  addresses.unshift(address);

  response.status(201).json({
    message: 'Address saved',
    address,
  });
});

app.patch('/addresses/:addressId', (request, response) => {
  const payload = request.body as Partial<AddressPayload>;
  const addressIndex = addresses.findIndex((address) => address.id === request.params.addressId);

  if (addressIndex === -1) {
    response.status(404).json({ message: 'Address not found' });
    return;
  }

  if (!payload.mahalle) {
    response.status(400).json({ message: 'Neighborhood selection is required' });
    return;
  }

  if (!/^\d{5}$/.test(payload.postaKodu ?? '')) {
    response.status(400).json({ message: 'Postal code must be 5 digits' });
    return;
  }

  const currentAddress = addresses[addressIndex];
  const updatedAddress: StoredAddress = {
    ...currentAddress,
    userId: payload.userId ?? currentAddress.userId,
    mahalle: payload.mahalle,
    ilce: payload.mahalle,
    il: 'Tirane',
    sokak: payload.sokak ?? '',
    apartmanNo: payload.apartmanNo ?? '',
    kat: payload.kat ?? '',
    daire: payload.daire ?? '',
    postaKodu: payload.postaKodu ?? '',
    isDefault: Boolean(payload.isDefault)
  };

  if (updatedAddress.isDefault) {
    for (const address of addresses) {
      if (address.userId === updatedAddress.userId) {
        address.isDefault = false;
      }
    }
  }

  addresses[addressIndex] = updatedAddress;

  response.json({
    message: 'Address updated',
    address: updatedAddress
  });
});

app.delete('/addresses/:addressId', (request, response) => {
  const userId = String(request.query.userId ?? 'user-1');
  const addressIndex = addresses.findIndex(
    (address) => address.id === request.params.addressId && address.userId === userId
  );

  if (addressIndex === -1) {
    response.status(404).json({ message: 'Address not found' });
    return;
  }

  const [deletedAddress] = addresses.splice(addressIndex, 1);
  const nextDefaultAddress = addresses.find((address) => address.userId === userId);

  if (deletedAddress.isDefault && nextDefaultAddress) {
    nextDefaultAddress.isDefault = true;
  }

  response.json({
    message: 'Address deleted',
    deletedId: deletedAddress.id
  });
});

app.listen(port, () => {
  console.log(`Cabuk backend is running on port ${port}`);
});
