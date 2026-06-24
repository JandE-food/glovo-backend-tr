import test from 'node:test';
import assert from 'node:assert/strict';

import { restaurants } from '../data/mockData';
import { calculateCartTotal } from '../store/useAppStore';
import {
  formatAddressSummary,
  getIlceFromMahalle,
  getSelectedAddress,
  getSelectedAddressId,
  isValidPostalCode,
} from '../utils/address';
import { formatCurrency } from '../utils/format';
import { filterRestaurantsByCategory } from '../utils/restaurants';

test('formatCurrency Turk Lirasi simgesiyle calisir', () => {
  assert.equal(formatCurrency(25), '₺25');
});

test('calculateCartTotal urun toplamlarini dogru hesaplar', () => {
  const total = calculateCartTotal([
    {
      id: 'm1',
      restaurantId: 'r3',
      nameKey: 'menu.simit.name',
      descriptionKey: 'menu.simit.description',
      price: 25,
      quantity: 2,
      restaurantNameKey: 'restaurants.uskudarPide.name',
    },
    {
      id: 'm2',
      restaurantId: 'r3',
      nameKey: 'menu.pide.name',
      descriptionKey: 'menu.pide.description',
      price: 45,
      quantity: 1,
      restaurantNameKey: 'restaurants.uskudarPide.name',
    },
  ]);

  assert.equal(total, 95);
});

test('filterRestaurantsByCategory kategorilere gore sonucu daraltir', () => {
  const filtered = filterRestaurantsByCategory(restaurants, 'market');

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0]?.id, 'r4');
});

test('isValidPostalCode sadece 5 haneli degerleri kabul eder', () => {
  assert.equal(isValidPostalCode('34710'), true);
  assert.equal(isValidPostalCode('3471'), false);
  assert.equal(isValidPostalCode('34A10'), false);
});

test('getIlceFromMahalle secilen mahalleyi ilce olarak doldurur', () => {
  assert.equal(getIlceFromMahalle('Kadıköy'), 'Kadıköy');
  assert.equal(getIlceFromMahalle(''), '');
});

test('formatAddressSummary teslimat adresini okunakli gosterir', () => {
  const summary = formatAddressSummary({
    id: 'address-1',
    userId: 'user-1',
    mahalle: 'Kadıköy',
    ilce: 'Kadıköy',
    il: 'İstanbul',
    sokak: 'Moda Caddesi',
    apartmanNo: '12',
    kat: '2',
    daire: '5',
    postaKodu: '34710',
    isDefault: true,
  });

  assert.match(summary, /Kadıköy/);
  assert.match(summary, /34710/);
});

test('getSelectedAddress kullanicinin sectigi teslimat adresini korur', () => {
  const addresses = [
    {
      id: 'address-1',
      userId: 'user-1',
      mahalle: 'Kadıköy',
      ilce: 'Kadıköy',
      il: 'İstanbul',
      sokak: 'Moda Caddesi',
      apartmanNo: '12',
      kat: '2',
      daire: '5',
      postaKodu: '34710',
      isDefault: true,
    },
    {
      id: 'address-2',
      userId: 'user-1',
      mahalle: 'Beşiktaş',
      ilce: 'Beşiktaş',
      il: 'İstanbul',
      sokak: 'Ihlamurdere Caddesi',
      apartmanNo: '8',
      kat: '1',
      daire: '3',
      postaKodu: '34353',
      isDefault: false,
    },
  ];

  assert.equal(getSelectedAddress(addresses, 'address-2')?.id, 'address-2');
  assert.equal(getSelectedAddressId(addresses, 'address-2'), 'address-2');
});

test('getSelectedAddress secim yoksa varsayilan adrese geri doner', () => {
  const addresses = [
    {
      id: 'address-1',
      userId: 'user-1',
      mahalle: 'Kadıköy',
      ilce: 'Kadıköy',
      il: 'İstanbul',
      sokak: 'Moda Caddesi',
      apartmanNo: '12',
      kat: '2',
      daire: '5',
      postaKodu: '34710',
      isDefault: true,
    },
    {
      id: 'address-2',
      userId: 'user-1',
      mahalle: 'Beşiktaş',
      ilce: 'Beşiktaş',
      il: 'İstanbul',
      sokak: 'Ihlamurdere Caddesi',
      apartmanNo: '8',
      kat: '1',
      daire: '3',
      postaKodu: '34353',
      isDefault: false,
    },
  ];

  assert.equal(getSelectedAddress(addresses, 'missing-id')?.id, 'address-1');
  assert.equal(getSelectedAddressId(addresses, 'missing-id'), 'address-1');
});
