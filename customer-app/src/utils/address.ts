import type { Address } from '../types/models';

export const mahalleOptions = [
  'Blloku',
  'Komuna e Parisit',
  'Pazari i Ri',
  'Don Bosko',
  'Liqeni i Thate',
  '21 Dhjetori',
] as const;

export type MahalleOption = (typeof mahalleOptions)[number];

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

export const formatAddressSummary = (address: Address) =>
  `${address.mahalle}, ${address.sokak}, Nr. ${address.apartmanNo}, Kati ${address.kat}, Ap. ${address.daire}, ${address.ilce} ${address.postaKodu}`;
