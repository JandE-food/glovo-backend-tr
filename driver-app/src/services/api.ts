import axios from 'axios';
import * as Location from 'expo-location';

import { connectDriverSocket } from './socket';
import type { DriverJob, DriverJobStatus } from '../types/models';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 8000
});

type AuthResponse = {
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
    rol?: string;
    role?: string;
  };
};

export const driverSignup = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const response = await api.post<AuthResponse>('/auth/signup', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone ?? '',
    role: 'driver'
  });

  return response.data;
};

export const driverLogin = async (email: string, password: string) => {
  const response = await api.post<AuthResponse>('/auth/login', {
    email,
    password
  });

  return response.data;
};

type BackendOrderApiRecord = {
  id?: string;
  _id?: string;
  restaurantId?: string;
  totalAmount?: number;
  toplamTutar?: number;
  total?: number;
  status?: string;
  durum?: string;
  deliveryAddress?: {
    neighborhood?: string;
    district?: string;
    city?: string;
    street?: string;
    buildingNumber?: string;
    apartment?: string;
  } | null;
  teslimatAdresi?: {
    mahalle?: string;
    ilce?: string;
    il?: string;
    sokak?: string;
    apartmanNo?: string;
    daire?: string;
  } | null;
  items?: Array<{
    adet?: number;
    quantity?: number;
  }>;
};

type BackendRestaurantApiRecord = {
  ad?: string;
  name?: string;
};

export type DriverOrderSocketPayload = BackendOrderApiRecord & {
  restaurantName?: string;
  restaurantTitle?: string;
};

const neighborhoodCenters: Record<DriverJob['neighborhood'], DriverJob['customerLocation']> = {
  Blloku: { latitude: 41.3194, longitude: 19.8156 },
  KomunaParisit: { latitude: 41.3095, longitude: 19.8018 },
  PazariRi: { latitude: 41.3314, longitude: 19.8249 },
  DonBosko: { latitude: 41.3442, longitude: 19.7941 }
};

const fallbackInstructions = [
  'Turn left at the next junction',
  'Continue straight for 200m',
  'Call the customer when you arrive'
];

const normalizeId = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.length > 0 ? value : fallback;

const normalizeStatus = (value?: string) =>
  value?.toLocaleLowerCase('en-US').replace(/\s+/g, '') ?? '';

const mapBackendStatusToDriverStatus = (value?: string): DriverJobStatus => {
  const normalized = normalizeStatus(value);

  if (normalized === 'kapıda' || normalized === 'kapida') {
    return 'atGate';
  }

  if (normalized === 'at_door' || normalized === 'atdoor') {
    return 'atGate';
  }

  if (normalized === 'yaklaşıyor' || normalized === 'yaklasiyor') {
    return 'enRoute';
  }

  if (normalized === 'approaching') {
    return 'enRoute';
  }

  if (normalized === 'alındı' || normalized === 'alindi') {
    return 'pickedUp';
  }

  if (normalized === 'ready') {
    return 'pickedUp';
  }

  if (normalized === 'hazırlanıyor' || normalized === 'hazirlaniyor') {
    return 'atStore';
  }

  if (normalized === 'preparing') {
    return 'atStore';
  }

  return 'available';
};

const mapDriverStatusToBackendStatus = (status: DriverJobStatus) => {
  if (status === 'enRoute') {
    return 'approaching';
  }

  if (status === 'atStore') {
    return 'preparing';
  }

  if (status === 'pickedUp') {
    return 'ready';
  }

  if (status === 'atGate') {
    return 'at_door';
  }

  return null;
};

const mapNeighborhood = (address?: BackendOrderApiRecord['teslimatAdresi']): DriverJob['neighborhood'] => {
  const source = `${address?.ilce ?? ''} ${address?.mahalle ?? ''}`
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (source.includes('komuna') || source.includes('parisit')) {
    return 'KomunaParisit';
  }

  if (source.includes('pazari') || source.includes('ri')) {
    return 'PazariRi';
  }

  if (source.includes('don bosko') || source.includes('bosko')) {
    return 'DonBosko';
  }

  return 'Blloku';
};

const mapAddressLabel = (
  address: BackendOrderApiRecord['teslimatAdresi'],
  neighborhood: DriverJob['neighborhood']
) => {
  const parts = [
    address?.sokak,
    address?.apartmanNo ? `No:${address.apartmanNo}` : '',
    address?.mahalle ?? neighborhood
  ].filter(Boolean);

  return parts.join(', ') || neighborhood;
};

const offsetCoordinate = (
  coordinate: DriverJob['customerLocation'],
  index: number,
  latitudeOffset: number,
  longitudeOffset: number
) => ({
  latitude: coordinate.latitude + latitudeOffset * ((index % 3) + 1),
  longitude: coordinate.longitude + longitudeOffset * ((index % 3) + 1)
});

const fetchRestaurantNameMap = async (restaurantIds: string[]) => {
  const restaurantEntries = await Promise.allSettled(
    restaurantIds.map(async (restaurantId) => {
      const response = await api.get<{ restaurant?: BackendRestaurantApiRecord }>(
        `/restaurants/${restaurantId}`
      );

      return [
        restaurantId,
        response.data.restaurant?.ad ?? response.data.restaurant?.name ?? 'Cabuk Restoran'
      ] as const;
    })
  );

  return restaurantEntries.reduce<Record<string, string>>((accumulator, entry) => {
    if (entry.status === 'fulfilled') {
      const [restaurantId, restaurantName] = entry.value;
      accumulator[restaurantId] = restaurantName;
    }

    return accumulator;
  }, {});
};

export const fetchDriverJobs = async (): Promise<DriverJob[]> => {
  const response = await api.get<{ orders?: BackendOrderApiRecord[] }>('/orders');
  const orders = (response.data.orders ?? []).filter((order) => {
    const status = normalizeStatus(order.status ?? order.durum);
    return status !== 'delivered' && status !== 'cancelled';
  });

  const restaurantIds = [...new Set(orders.map((order) => order.restaurantId).filter(Boolean))];
  const restaurantNameMap = await fetchRestaurantNameMap(restaurantIds as string[]);

  return orders.map((order, index) => {
    const deliveryAddress = order.deliveryAddress
      ? {
          mahalle: order.deliveryAddress.neighborhood,
          ilce: order.deliveryAddress.district,
          il: order.deliveryAddress.city,
          sokak: order.deliveryAddress.street,
          apartmanNo: order.deliveryAddress.buildingNumber,
          daire: order.deliveryAddress.apartment
        }
      : order.teslimatAdresi ?? undefined;
    const neighborhood = mapNeighborhood(deliveryAddress);
    const customerLocation = offsetCoordinate(
      neighborhoodCenters[neighborhood],
      index,
      0.0025,
      0.002
    );
    const restaurantLocation = offsetCoordinate(customerLocation, index, -0.004, -0.003);
    const itemCount = (order.items ?? []).reduce(
      (total, item) => total + Number(item.adet ?? item.quantity ?? 1),
      0
    );

    return {
      id: normalizeId(order.id ?? order._id, `order-${index}`),
      restaurantName:
        restaurantNameMap[order.restaurantId ?? ''] ?? order.restaurantId ?? 'Cabuk Restaurant',
      address: mapAddressLabel(deliveryAddress, neighborhood),
      neighborhood,
      payout: Number(order.totalAmount ?? order.toplamTutar ?? order.total ?? 0),
      distanceKm: Number((1.2 + index * 0.7).toFixed(1)),
      status: mapBackendStatusToDriverStatus(order.status ?? order.durum),
      customerName: `Dropoff ${index + 1}`,
      itemCount,
      restaurantLocation,
      customerLocation,
      instructions: fallbackInstructions
    };
  });
};

export const mapDriverOrderSocketPayload = (
  order: DriverOrderSocketPayload,
  index = 0
): DriverJob => {
  const deliveryAddress = order.deliveryAddress
    ? {
        mahalle: order.deliveryAddress.neighborhood,
        ilce: order.deliveryAddress.district,
        il: order.deliveryAddress.city,
        sokak: order.deliveryAddress.street,
        apartmanNo: order.deliveryAddress.buildingNumber,
        daire: order.deliveryAddress.apartment
      }
    : order.teslimatAdresi ?? undefined;
  const neighborhood = mapNeighborhood(deliveryAddress);
  const customerLocation = offsetCoordinate(neighborhoodCenters[neighborhood], index, 0.0025, 0.002);
  const restaurantLocation = offsetCoordinate(customerLocation, index, -0.004, -0.003);
  const itemCount = (order.items ?? []).reduce(
    (total, item) => total + Number(item.adet ?? item.quantity ?? 1),
    0
  );

  return {
    id: normalizeId(order.id ?? order._id, `order-${Date.now()}`),
    restaurantName:
      order.restaurantName ?? order.restaurantTitle ?? order.restaurantId ?? 'Cabuk Restaurant',
    address: mapAddressLabel(deliveryAddress, neighborhood),
    neighborhood,
    payout: Number(order.totalAmount ?? order.toplamTutar ?? order.total ?? 0),
    distanceKm: Number((1.2 + index * 0.7).toFixed(1)),
    status: mapBackendStatusToDriverStatus(order.status ?? order.durum),
    customerName: `Dropoff ${index + 1}`,
    itemCount,
    restaurantLocation,
    customerLocation,
    instructions: fallbackInstructions
  };
};

export const listenForDriverOrders = (onOrderAvailable: (job: DriverJob) => void) => {
  const socket = connectDriverSocket();

  const handleOrderAvailable = (payload: DriverOrderSocketPayload) => {
    onOrderAvailable(mapDriverOrderSocketPayload(payload, Date.now() % 3));
  };

  socket.on('driver_order_available', handleOrderAvailable);

  return () => {
    socket.off('driver_order_available', handleOrderAvailable);
  };
};

export const syncDriverJobStatus = async (jobId: string, status: DriverJobStatus) => {
  const backendStatus = mapDriverStatusToBackendStatus(status);

  if (!backendStatus) {
    return;
  }

  await api.patch(`/orders/${jobId}/status`, {
    status: backendStatus
  });
};

let locationIntervalId: ReturnType<typeof setInterval> | undefined;

export const startDriverLocationStreaming = async (orderId: string) => {
  if (!orderId) {
    return () => undefined;
  }

  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    return () => undefined;
  }

  const socket = connectDriverSocket();

  const emitCurrentLocation = async () => {
    try {
      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      socket.emit('driver_location', {
        orderId,
        location: {
          lat: currentPosition.coords.latitude,
          lng: currentPosition.coords.longitude
        }
      });
    } catch {
      // Ignore one-off location failures and retry on the next interval tick.
    }
  };

  await emitCurrentLocation();

  if (locationIntervalId) {
    clearInterval(locationIntervalId);
  }

  locationIntervalId = setInterval(() => {
    void emitCurrentLocation();
  }, 2000);

  return () => {
    if (locationIntervalId) {
      clearInterval(locationIntervalId);
      locationIntervalId = undefined;
    }
  };
};
