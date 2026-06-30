export type MerchantRestaurantType =
  | 'restaurants'
  | 'breakfast'
  | 'pide'
  | 'desserts'
  | 'market'
  | 'pharmacy';

export type SiparisDurumu =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'approaching'
  | 'at_door';

export type SiparisKalemi = {
  ad: string;
  adet: number;
  fiyat: number;
};

export type MerchantOrder = {
  id: string;
  userId: string;
  musteriAdi: string;
  items: SiparisKalemi[];
  adres: string;
  total: number;
  durum: SiparisDurumu;
  olusturmaSaati: string;
  createdAt?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverAvatar?: string;
};

export type MerchantNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type InventoryItem = {
  id: string;
  ad: string;
  stoktaVar: boolean;
  kategori: string;
  fiyat?: number;
  aciklama?: string;
  isCustom?: boolean;
  imageUrl?: string;
};

export type MerchantRestaurantProfile = {
  id: string;
  ad: string;
  aciklama?: string;
  imageUrl?: string;
  ownerEmail?: string;
  kategori?: MerchantRestaurantType;
  menu: InventoryItem[];
};

export type FinancialSummary = {
  gunlukCiro: number;
  siparisSayisi: number;
  netKazanc: number;
  komisyonOrani: number;
};
