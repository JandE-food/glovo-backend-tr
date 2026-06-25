import axios, { isAxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

import type {
  Address,
  AddressPayload,
  BackendOrderResponse,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentGatewayResponse,
  Restaurant
} from '../types/models';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://135.125.184.123:3000';
export const DEFAULT_USER_ID = 'user-1';
const LOCAL_ADDRESSES_STORAGE_KEY_PREFIX = 'cabuk-customer-addresses';

type AuthResponse = {
  message?: string;
  token?: string;
  user?: {
    id?: string;
    _id?: string;
    userId?: string;
    adSoyad?: string;
    name?: string;
    email?: string;
    telefon?: string;
    phone?: string;
  };
};

type RestaurantApiRecord = {
  id?: string;
  _id?: string;
  ad?: string;
  name?: string;
  aciklama?: string;
  description?: string;
  puan?: number;
  rating?: number;
  teslimatSuresi?: string;
  deliveryTime?: string;
  kategori?: string;
  category?: string;
  imageUrl?: string;
  image?: string;
  menu?: MenuItemApiRecord[];
};

type MenuItemApiRecord = {
  id?: string;
  _id?: string;
  urunId?: string;
  ad?: string;
  name?: string;
  aciklama?: string;
  description?: string;
  fiyat?: number;
  price?: number;
};

type OrderApiRecord = {
  id?: string;
  _id?: string;
  userId?: string;
  restaurantId?: string;
  restaurantName?: string;
  restaurantTitle?: string;
  totalAmount?: number;
  toplamTutar?: number;
  total?: number;
  durum?: string;
  status?: string;
  createdAt?: string;
  odemeYontemi?: PaymentMethod;
  paymentMethod?: PaymentMethod;
  odemeIslemId?: string;
  paymentTransactionId?: string;
  teslimatAdresi?: AddressApiRecord;
  deliveryAddress?: AddressApiRecord;
  items?: OrderItemApiRecord[];
};

type OrderItemApiRecord = {
  id?: string;
  _id?: string;
  urunId?: string;
  ad?: string;
  name?: string;
  aciklama?: string;
  description?: string;
  adet?: number;
  quantity?: number;
  fiyat?: number;
  price?: number;
};

type AddressApiRecord = {
  id?: string;
  _id?: string;
  userId?: string;
  mahalle?: string;
  ilce?: string;
  il?: string;
  sokak?: string;
  apartmanNo?: string;
  kat?: string;
  daire?: string;
  postaKodu?: string;
  isDefault?: boolean;
};

type CreateOrderPayload = {
  userId: string;
  restaurantId: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  paymentTransactionId: string;
  deliveryAddress: Address;
};

type PaystackCheckoutPayload = {
  orderId: string;
  amount: number;
  currency: 'ALL';
  paymentMethod: PaymentMethod;
  email: string;
  redirectUrl?: string;
  metadata: {
    orderId: string;
  };
};

type PaystackVerifyPayload = {
  orderId: string;
  txRef: string;
  paymentMethod?: PaymentMethod;
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 8000
});
export const socket = io(API_URL, {
  transports: ['websocket']
});

let joinedCustomerRoomUserId: string | null = null;
let joinedOrderRoomId: string | null = null;

const categoryQueryMap: Record<string, string> = {
  all: 'restaurants',
  restaurants: 'restaurants',
  breakfast: 'breakfast',
  pide: 'pide',
  desserts: 'desserts',
  market: 'market',
  pharmacy: 'pharmacy'
};

const categoryValueMap: Record<string, Restaurant['category']> = {
  restoranlar: 'restaurants',
  restaurant: 'restaurants',
  restaurants: 'restaurants',
  kahvalti: 'breakfast',
  breakfast: 'breakfast',
  pide: 'pide',
  tatli: 'desserts',
  tatlilar: 'desserts',
  desserts: 'desserts',
  market: 'market',
  groceries: 'market',
  grocery: 'market',
  eczane: 'pharmacy',
  pharmacy: 'pharmacy'
};

const orderStatusMap: Record<string, OrderStatus> = {
  received: 'received',
  preparing: 'preparing',
  ready: 'ready',
  approaching: 'approaching',
  atdoor: 'at_door',
  at_door: 'at_door',
  delivered: 'delivered',
  cancelled: 'cancelled'
};

const normalizeId = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.length > 0 ? value : fallback;

const getLocalAddressesStorageKey = (userId: string) =>
  `${LOCAL_ADDRESSES_STORAGE_KEY_PREFIX}:${userId || DEFAULT_USER_ID}`;

const normalizeLocalAddress = (address: Partial<Address>): Address => ({
  id: normalizeId(address.id, `address-${Date.now()}`),
  userId: address.userId ?? DEFAULT_USER_ID,
  mahalle: address.mahalle ?? '',
  ilce: address.ilce ?? address.mahalle ?? '',
  il: address.il ?? 'Tirane',
  sokak: address.sokak ?? '',
  apartmanNo: address.apartmanNo ?? '',
  kat: address.kat ?? '',
  daire: address.daire ?? '',
  postaKodu: address.postaKodu ?? '',
  isDefault: Boolean(address.isDefault)
});

const readLocalAddresses = async (userId: string) => {
  const rawValue = await AsyncStorage.getItem(getLocalAddressesStorageKey(userId));
  if (!rawValue) {
    return [] as Address[];
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<Address>[];
    return Array.isArray(parsed) ? parsed.map(normalizeLocalAddress) : [];
  } catch {
    return [];
  }
};

const writeLocalAddresses = async (userId: string, addresses: Address[]) => {
  await AsyncStorage.setItem(
    getLocalAddressesStorageKey(userId),
    JSON.stringify(addresses.map(normalizeLocalAddress))
  );
};

const mergeAddresses = (primaryAddresses: Address[], secondaryAddresses: Address[]) => {
  const merged = [...primaryAddresses];

  for (const address of secondaryAddresses) {
    if (!merged.some((entry) => entry.id === address.id)) {
      merged.push(address);
    }
  }

  return merged;
};

export const isNetworkUnavailableError = (error: unknown) => {
  if (isAxiosError(error)) {
    return !error.response;
  }

  if (error instanceof Error) {
    const message = error.message.toLocaleLowerCase('en-US');
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('unable to connect')
    );
  }

  return false;
};

const mapRestaurantCategory = (value?: string): Restaurant['category'] => {
  const normalized = value?.toLocaleLowerCase('en-US').replace(/\s+/g, '') ?? '';

  return categoryValueMap[normalized] ?? 'restaurants';
};

const mapAddress = (address: AddressApiRecord): Address => ({
  id: normalizeId(address.id ?? address._id, `address-${Date.now()}`),
  userId: address.userId,
  mahalle: address.mahalle ?? '',
  ilce: address.ilce ?? address.mahalle ?? '',
  il: address.il ?? 'Tirane',
  sokak: address.sokak ?? '',
  apartmanNo: address.apartmanNo ?? '',
  kat: address.kat ?? '',
  daire: address.daire ?? '',
  postaKodu: address.postaKodu ?? '',
  isDefault: Boolean(address.isDefault)
});

const mapRestaurant = (restaurant: RestaurantApiRecord): Restaurant => ({
  id: normalizeId(restaurant.id ?? restaurant._id, `restaurant-${Date.now()}`),
  nameKey: restaurant.ad ?? restaurant.name ?? 'Restaurant',
  descriptionKey: restaurant.aciklama ?? restaurant.description ?? '',
  rating: Number(restaurant.puan ?? restaurant.rating ?? 0),
  deliveryTime: restaurant.teslimatSuresi ?? restaurant.deliveryTime ?? '',
  category: mapRestaurantCategory(restaurant.kategori ?? restaurant.category),
  imageUrl:
    restaurant.imageUrl ??
    restaurant.image ??
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=realistic%20Tirana%20restaurant%20storefront%2C%20food%20delivery%20listing%20cover%2C%20warm%20lighting%2C%20professional%20food%20app%20photo&image_size=landscape_16_9'
});

const mapMenuItem = (item: MenuItemApiRecord, restaurantId: string, restaurantName: string) => ({
  id: normalizeId(item.id ?? item._id ?? item.urunId, `menu-${Date.now()}`),
  restaurantId,
  nameKey: item.ad ?? item.name ?? 'Menu Item',
  descriptionKey: item.aciklama ?? item.description ?? '',
  price: Number(item.fiyat ?? item.price ?? 0),
  restaurantNameKey: restaurantName,
  quantity: 1
});

const mapOrderStatus = (status?: string): OrderStatus => {
  const normalized = status?.toLocaleLowerCase('en-US').replace(/\s+/g, '') ?? '';

  return orderStatusMap[normalized] ?? 'received';
};

const mapOrder = (order: OrderApiRecord): Order => {
  const restaurantName =
    order.restaurantName ?? order.restaurantTitle ?? order.restaurantId ?? 'Restaurant';

  return {
    id: normalizeId(order.id ?? order._id, `order-${Date.now()}`),
    restaurantNameKey: restaurantName,
    items: (order.items ?? []).map((item) => ({
      ...mapMenuItem(item, order.restaurantId ?? '', restaurantName),
      quantity: Number(item.quantity ?? item.adet ?? 1)
    })),
    total: Number(order.totalAmount ?? order.toplamTutar ?? order.total ?? 0),
    status: mapOrderStatus(order.status ?? order.durum),
    createdAt: order.createdAt ?? new Date().toISOString(),
    deliveryAddress: order.deliveryAddress
      ? mapAddress(order.deliveryAddress)
      : order.teslimatAdresi
        ? mapAddress(order.teslimatAdresi)
        : undefined,
    paymentMethod: order.paymentMethod ?? order.odemeYontemi,
    paymentTransactionId: order.paymentTransactionId ?? order.odemeIslemId,
    backendOrderId: normalizeId(order.id ?? order._id, '')
  };
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
  options?: {
    invalidCredentialsMessage?: string;
  }
) => {
  if (isAxiosError(error)) {
    const responseData =
      error.response?.data && typeof error.response.data === 'object'
        ? (error.response.data as { message?: string })
        : undefined;

    if (!error.response) {
      return 'Network error';
    }

    if (error.response.status === 401 && options?.invalidCredentialsMessage) {
      return options.invalidCredentialsMessage;
    }

    if (typeof responseData?.message === 'string') {
      return responseData.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};

export const login = async (email: string, password: string) => {
  const response = await api.post<AuthResponse>('/auth/login', {
    email,
    password
  });

  return response.data;
};

export const signup = async (name: string, email: string, password: string, phone: string) => {
  const response = await api.post<AuthResponse>('/auth/signup', {
    name,
    email,
    password,
    phone
  });

  return response.data;
};

export const getRestaurants = async (category: string) => {
  const response = await api.get<{ restaurants: RestaurantApiRecord[] }>('/restaurants', {
    params: {
      category: categoryQueryMap[category] ?? category
    }
  });

  return (response.data.restaurants ?? []).map(mapRestaurant);
};

export const getRestaurant = async (id: string) => {
  const response = await api.get<{ restaurant: RestaurantApiRecord }>(`/restaurants/${id}`);
  const restaurant = mapRestaurant(response.data.restaurant);
  const menu = (response.data.restaurant.menu ?? []).map((item) =>
    mapMenuItem(item, restaurant.id, restaurant.nameKey)
  );

  return {
    restaurant,
    menu
  };
};

export const createOrder = async (orderData: CreateOrderPayload) => {
  const response = await api.post('/orders', orderData);

  return response.data;
};

export const createPendingOrder = async (orderData: CreateOrderPayload) => {
  const response = await api.post<BackendOrderResponse>('/orders', {
    ...orderData,
    paymentStatus: 'pending',
    paymentTransactionId: ''
  });

  return response.data;
};

export const createPaystackCheckout = async (payload: PaystackCheckoutPayload) => {
  const response = await api.post<PaymentGatewayResponse>('/payments/paystack', payload);

  return response.data;
};

export const verifyPaystackPayment = async (payload: PaystackVerifyPayload) => {
  const response = await api.post<PaymentGatewayResponse>('/payments/paystack', {
    action: 'verify_payment',
    ...payload
  });

  return response.data;
};

export const getOrders = async (userId: string) => {
  const response = await api.get<{ orders: OrderApiRecord[] }>('/orders', {
    params: { userId }
  });

  return (response.data.orders ?? []).map(mapOrder);
};

export const saveAddress = async (address: AddressPayload) => {
  try {
    const response = await api.post<{ address: AddressApiRecord }>('/addresses', address);
    const nextAddress = mapAddress(response.data.address);
    const cachedAddresses = await readLocalAddresses(nextAddress.userId ?? address.userId);
    const nextAddresses = [
      nextAddress,
      ...cachedAddresses
        .filter((entry) => entry.id !== nextAddress.id)
        .map((entry) => (nextAddress.isDefault ? { ...entry, isDefault: false } : entry))
    ];
    await writeLocalAddresses(nextAddress.userId ?? address.userId, nextAddresses);
    return nextAddress;
  } catch (error) {
    if (!isNetworkUnavailableError(error)) {
      throw error;
    }

    const userId = address.userId || DEFAULT_USER_ID;
    const cachedAddresses = await readLocalAddresses(userId);
    const nextAddress = normalizeLocalAddress({
      id: `local-address-${Date.now()}`,
      userId,
      mahalle: address.mahalle,
      ilce: address.mahalle,
      il: 'Tirane',
      sokak: address.sokak,
      apartmanNo: address.apartmanNo,
      kat: address.kat,
      daire: address.daire,
      postaKodu: address.postaKodu,
      isDefault: address.isDefault
    });
    const nextAddresses = [
      nextAddress,
      ...cachedAddresses
        .filter((entry) => entry.id !== nextAddress.id)
        .map((entry) => (nextAddress.isDefault ? { ...entry, isDefault: false } : entry))
    ];
    await writeLocalAddresses(userId, nextAddresses);
    return nextAddress;
  }
};

export const getAddresses = async (userId: string) => {
  try {
    const response = await api.get<{ addresses: AddressApiRecord[] }>('/addresses', {
      params: { userId }
    });
    const remoteAddresses = (response.data.addresses ?? []).map(mapAddress);
    const cachedAddresses = await readLocalAddresses(userId);
    const nextAddresses = mergeAddresses(remoteAddresses, cachedAddresses);
    await writeLocalAddresses(userId, nextAddresses);
    return nextAddresses;
  } catch (error) {
    if (!isNetworkUnavailableError(error)) {
      throw error;
    }

    return readLocalAddresses(userId);
  }
};

export const updateSavedAddress = async (addressId: string, payload: AddressPayload) => {
  try {
    const response = await api.patch<{ address: AddressApiRecord }>(`/addresses/${addressId}`, payload);
    const updatedAddress = mapAddress(response.data.address);
    const userId = updatedAddress.userId ?? payload.userId ?? DEFAULT_USER_ID;
    const cachedAddresses = await readLocalAddresses(userId);
    const nextAddresses = cachedAddresses.map((entry) =>
      entry.id === updatedAddress.id
        ? updatedAddress
        : updatedAddress.isDefault
          ? { ...entry, isDefault: false }
          : entry
    );
    await writeLocalAddresses(userId, nextAddresses);
    return updatedAddress;
  } catch (error) {
    if (!isNetworkUnavailableError(error)) {
      throw error;
    }

    const userId = payload.userId || DEFAULT_USER_ID;
    const cachedAddresses = await readLocalAddresses(userId);
    const currentAddress = cachedAddresses.find((entry) => entry.id === addressId);

    if (!currentAddress) {
      throw error;
    }

    const updatedAddress = normalizeLocalAddress({
      ...currentAddress,
      ...payload,
      id: addressId,
      userId,
      ilce: payload.mahalle,
      il: 'Tirane'
    });
    const nextAddresses = cachedAddresses.map((entry) =>
      entry.id === addressId
        ? updatedAddress
        : updatedAddress.isDefault
          ? { ...entry, isDefault: false }
          : entry
    );
    await writeLocalAddresses(userId, nextAddresses);
    return updatedAddress;
  }
};

export const deleteSavedAddress = async (addressId: string, userId: string) => {
  try {
    await api.delete(`/addresses/${addressId}`, {
      params: { userId }
    });
  } catch (error) {
    if (!isNetworkUnavailableError(error)) {
      throw error;
    }
  }

  const cachedAddresses = await readLocalAddresses(userId);
  const deletedAddress = cachedAddresses.find((entry) => entry.id === addressId);
  let nextAddresses = cachedAddresses.filter((entry) => entry.id !== addressId);

  if (
    deletedAddress?.isDefault &&
    nextAddresses.length > 0 &&
    !nextAddresses.some((entry) => entry.isDefault)
  ) {
    nextAddresses = nextAddresses.map((entry, index) => ({
      ...entry,
      isDefault: index === 0
    }));
  }

  await writeLocalAddresses(userId, nextAddresses);
};

export const listenOrderUpdates = (
  userId: string,
  setOrders: (orders: Order[]) => void,
  onStatusUpdated?: (status: OrderStatus) => void
) => {
  const eventNames = [
    'order_status_changed'
  ] as const;

  const handleOrderUpdated = async (updatedOrder: OrderApiRecord) => {
    try {
      const nextOrders = await getOrders(userId);
      setOrders(nextOrders);
    } catch {
      // Keep the current orders list if the refresh fails.
    }

    const nextStatus = mapOrderStatus(updatedOrder.status ?? updatedOrder.durum);
    onStatusUpdated?.(nextStatus);
  };

  if (!socket.connected) {
    socket.connect();
  }

  if (joinedCustomerRoomUserId && joinedCustomerRoomUserId !== userId) {
    socket.emit('customer_room_leave', joinedCustomerRoomUserId);
  }

  socket.emit('customer_room_join', userId);
  joinedCustomerRoomUserId = userId;

  for (const eventName of eventNames) {
    socket.on(eventName, handleOrderUpdated);
  }

  return () => {
    for (const eventName of eventNames) {
      socket.off(eventName, handleOrderUpdated);
    }

    if (joinedCustomerRoomUserId === userId) {
      socket.emit('customer_room_leave', userId);
      joinedCustomerRoomUserId = null;
    }
  };
};

export type DriverLocation = {
  lat: number;
  lng: number;
};

export const listenDriverLocation = (
  orderId: string,
  onLocationUpdated: (location: DriverLocation) => void
) => {
  if (!socket.connected) {
    socket.connect();
  }

  if (joinedOrderRoomId && joinedOrderRoomId !== orderId) {
    socket.emit('order_room_leave', joinedOrderRoomId);
  }

  socket.emit('order_room_join', orderId);
  joinedOrderRoomId = orderId;
  socket.on('driver_location', onLocationUpdated);

  return () => {
    socket.off('driver_location', onLocationUpdated);

    if (joinedOrderRoomId === orderId) {
      socket.emit('order_room_leave', orderId);
      joinedOrderRoomId = null;
    }
  };
};
