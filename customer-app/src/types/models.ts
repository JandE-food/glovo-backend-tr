export type CategoryId = 'all' | 'restaurants' | 'breakfast' | 'pide' | 'desserts' | 'market' | 'pharmacy';

export type AppLanguage = 'sq' | 'en' | 'sr';

export type Restaurant = {
  id: string;
  nameKey: string;
  descriptionKey: string;
  rating: number;
  deliveryTime: string;
  category: Exclude<CategoryId, 'all'>;
  imageUrl: string;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  nameKey: string;
  descriptionKey: string;
  price: number;
  imageUrl?: string;
};

export type CartItem = MenuItem & {
  quantity: number;
  restaurantNameKey: string;
};

export type PaymentMethod = 'card' | 'qr';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'approaching'
  | 'at_door'
  | 'delivered'
  | 'cancelled';

export type Order = {
  id: string;
  restaurantNameKey: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress?: Address;
  paymentMethod?: PaymentMethod;
  paymentTransactionId?: string;
  backendOrderId?: string;
  assignedDriverName?: string;
  assignedDriverAvatar?: string;
  deliveryLocation?: Coordinates;
  driverLocation?: Coordinates;
};

export type Address = {
  id: string;
  userId?: string;
  mahalle: string;
  ilce: string;
  il: string;
  sokak: string;
  apartmanNo: string;
  kat: string;
  daire: string;
  postaKodu: string;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export type AddressPayload = {
  userId: string;
  mahalle: string;
  sokak: string;
  apartmanNo: string;
  kat: string;
  daire: string;
  postaKodu: string;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export type PaymentGatewayResponse = {
  success: boolean;
  transactionId: string;
  txRef?: string;
  checkoutUrl?: string;
  paymentMethod?: PaymentMethod;
  transactionFeeAll?: number;
  supportedBanks?: string[];
  amountChargedAll?: number;
  message?: string;
};

export type BackendOrderResponse = {
  message: string;
  order: {
    id?: string;
    _id?: string;
  };
};
