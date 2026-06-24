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
  ad: 'Byrek' | 'Tave Kosi' | 'Trilece' | 'Qofte';
  stoktaVar: boolean;
  kategori: string;
};

export type FinancialSummary = {
  gunlukCiro: number;
  siparisSayisi: number;
  netKazanc: number;
  komisyonOrani: number;
};
