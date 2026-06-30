import type { Address, Coordinates } from '../types/models';

export const mahalleOptions = [
  'Blloku',
  'Komuna e Parisit',
  'Pazari i Ri',
  'Don Bosko',
  'Liqeni i Thate',
  '21 Dhjetori',
] as const;

export type MahalleOption = (typeof mahalleOptions)[number];

export const neighborhoodCoordinates: Record<string, Coordinates> = {
  blloku: { latitude: 41.3194, longitude: 19.8156 },
  'komuna e parisit': { latitude: 41.3095, longitude: 19.8018 },
  'pazari i ri': { latitude: 41.3314, longitude: 19.8249 },
  'don bosko': { latitude: 41.3442, longitude: 19.7941 },
  'liqeni i thate': { latitude: 41.3049, longitude: 19.7993 },
  '21 dhjetori': { latitude: 41.3201, longitude: 19.7928 }
};

export const getIlceFromMahalle = (mahalle: string) => {
  if (!mahalle) {
    return '';
  }

  return mahalle;
};

export const isValidPostalCode = (postaKodu: string) => /^\d{5}$/.test(postaKodu);

export const getSelectedAddress = (
  addresses: Address[],
  selectedAddressId: string | null,
) =>
  addresses.find((address) => address.id === selectedAddressId) ??
  addresses.find((address) => address.isDefault) ??
  addresses[0] ??
  null;

export const getSelectedAddressId = (
  addresses: Address[],
  selectedAddressId: string | null,
) => getSelectedAddress(addresses, selectedAddressId)?.id ?? null;

export const getAddressCoordinates = (address?: Address | null): Coordinates | null => {
  if (
    address &&
    typeof address.latitude === 'number' &&
    Number.isFinite(address.latitude) &&
    typeof address.longitude === 'number' &&
    Number.isFinite(address.longitude)
  ) {
    return {
      latitude: address.latitude,
      longitude: address.longitude
    };
  }

  const neighborhoodKey = address?.mahalle?.trim().toLocaleLowerCase('en-US') ?? '';
  return neighborhoodCoordinates[neighborhoodKey] ?? null;
};

export const formatAddressSummary = (address: Address) =>
  `${address.mahalle}, ${address.sokak}, Nr. ${address.apartmanNo}, Kati ${address.kat}, Ap. ${address.daire}, ${address.ilce} ${address.postaKodu}`;
