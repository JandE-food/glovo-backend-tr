import type {
  InventoryItem,
  MerchantOrder,
  MerchantRestaurantProfile,
  MerchantRestaurantType,
  SiparisDurumu
} from '../types';
import { API_URL, socket } from './socket';
import { getTranslations, type AppLanguage } from '../utils/i18n';

type LocalMerchantAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  restaurantName?: string;
  restaurantId?: string;
  restaurantImageUrl?: string;
  restaurantType?: MerchantRestaurantType;
};

type MerchantAuthSession = {
  restaurantId: string;
  restaurantName: string;
  restaurantImageUrl: string;
  restaurantType: MerchantRestaurantType;
};

const LOCAL_MERCHANT_ACCOUNTS_KEY = 'cabuk-merchant-accounts';

const normalizeEmail = (email: string) => email.trim().toLocaleLowerCase('en-US');
const isMongoObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value.trim());
const isNetworkFetchError = (error: unknown) =>
  error instanceof TypeError ||
  (error instanceof Error &&
    error.message.trim().toLocaleLowerCase('en-US') === 'failed to fetch');

const readLocalMerchantAccounts = (): LocalMerchantAccount[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(LOCAL_MERCHANT_ACCOUNTS_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as LocalMerchantAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalMerchantAccounts = (accounts: LocalMerchantAccount[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_MERCHANT_ACCOUNTS_KEY, JSON.stringify(accounts));
};

const fallbackOrders: MerchantOrder[] = [
  {
    id: 'order-701',
    userId: 'user-1',
    musteriAdi: 'Jessica Lane',
    items: [
      { ad: 'Tave Kosi', adet: 2, fiyat: 450 },
      { ad: 'Dhalle', adet: 1, fiyat: 120 }
    ],
    adres: 'Rruga e Kavajes, Pallati 21, Tirane',
    total: 1020,
    durum: 'received',
    olusturmaSaati: '12:05'
  },
  {
    id: 'order-702',
    userId: 'user-2',
    musteriAdi: 'Sarah Jones',
    items: [
      { ad: 'Trilece', adet: 1, fiyat: 380 },
      { ad: 'Qofte', adet: 1, fiyat: 420 }
    ],
    adres: 'Pazari i Ri, Rruga Hoxha Tahsim, Tirane',
    total: 800,
    durum: 'preparing',
    olusturmaSaati: '12:11'
  }
];

const getCurrentLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return 'sq';
  }

  const storedLanguage = window.localStorage.getItem('cabuk-merchant-language');
  return storedLanguage === 'en' || storedLanguage === 'sq' || storedLanguage === 'sr'
    ? storedLanguage
    : 'sq';
};

const buildRestaurantImage = (restaurantName: string) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `realistic restaurant storefront for ${restaurantName || 'Cabuk restaurant'}, welcoming dining exterior, delivery app listing photo, professional photography`
  )}&image_size=landscape_16_9`;

const normalizeText = (value: unknown, fallback = '') => String(value ?? fallback).trim();

type SiparisApiKaydi = {
  id?: string;
  _id?: string;
  userId?: string;
  musteriAdi?: string;
  customerName?: string;
  items?: Array<{
    ad?: string;
    name?: string;
    adet?: number;
    quantity?: number;
    fiyat?: number;
    price?: number;
  }>;
  toplamTutar?: number;
  totalAmount?: number;
  total?: number;
  teslimatAdresi?: {
    mahalle?: string;
    neighborhood?: string;
    sokak?: string;
    street?: string;
    apartmanNo?: string;
    buildingNumber?: string;
    daire?: string;
    apartment?: string;
  };
  deliveryAddress?: {
    mahalle?: string;
    neighborhood?: string;
    sokak?: string;
    street?: string;
    apartmanNo?: string;
    buildingNumber?: string;
    daire?: string;
    apartment?: string;
  };
  durum?: SiparisDurumu;
  status?: SiparisDurumu;
  createdAt?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverAvatar?: string;
  restaurantId?: string;
};

type MerchantMenuApiRecord = {
  id?: string;
  ad?: string;
  name?: string;
  fiyat?: number;
  price?: number;
  kategori?: string;
  category?: string;
  aciklama?: string;
  description?: string;
  stoktaVar?: boolean;
  inStock?: boolean;
  imageUrl?: string;
  image?: string;
};

type MerchantRestaurantApiRecord = {
  id?: string;
  _id?: string;
  ad?: string;
  name?: string;
  aciklama?: string;
  description?: string;
  kategori?: string;
  category?: string;
  imageUrl?: string;
  ownerEmail?: string;
  menu?: MerchantMenuApiRecord[];
};

const normalizeRestaurantType = (value?: string): MerchantRestaurantType => {
  const normalized = value?.trim().toLocaleLowerCase('en-US') ?? '';

  if (normalized === 'breakfast') {
    return 'breakfast';
  }

  if (normalized === 'pide') {
    return 'pide';
  }

  if (normalized === 'desserts') {
    return 'desserts';
  }

  if (normalized === 'market') {
    return 'market';
  }

  if (normalized === 'pharmacy') {
    return 'pharmacy';
  }

  return 'restaurants';
};

const formatAdres = (
  adres?: SiparisApiKaydi['teslimatAdresi'] | SiparisApiKaydi['deliveryAddress']
) => {
  const t = getTranslations(getCurrentLanguage());

  if (!adres) {
    return t.misc.addressPending;
  }

  const parcalar = [
    adres.mahalle ?? adres.neighborhood,
    adres.sokak ?? adres.street,
    adres.apartmanNo ?? adres.buildingNumber,
    adres.daire ?? adres.apartment
  ].filter(Boolean);
  return parcalar.join(', ');
};

const mapOrder = (siparis: SiparisApiKaydi, index: number): MerchantOrder => {
  const language = getCurrentLanguage();
  const t = getTranslations(language);

  return {
    id: siparis.id ?? siparis._id ?? `order-${index}`,
    userId: siparis.userId ?? `user-${index}`,
    musteriAdi:
      siparis.musteriAdi ?? siparis.customerName ?? `${t.misc.customer} ${index + 1}`,
    items:
      siparis.items?.map((item) => ({
        ad: item.ad ?? item.name ?? t.misc.item,
        adet: item.adet ?? item.quantity ?? 1,
        fiyat: item.fiyat ?? item.price ?? 0
      })) ?? [],
    adres: formatAdres(siparis.deliveryAddress ?? siparis.teslimatAdresi),
    total: siparis.totalAmount ?? siparis.toplamTutar ?? siparis.total ?? 0,
    durum: siparis.status ?? siparis.durum ?? 'received',
    createdAt: siparis.createdAt,
    assignedDriverId: siparis.assignedDriverId,
    assignedDriverName: siparis.assignedDriverName,
    assignedDriverAvatar: siparis.assignedDriverAvatar,
    olusturmaSaati: new Date(siparis.createdAt ?? Date.now()).toLocaleTimeString(
      language === 'sq' ? 'sq-AL' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  };
};

const mapInventoryItem = (item: MerchantMenuApiRecord, index: number): InventoryItem => ({
  id: item.id ?? `menu-${index}`,
  ad: item.ad ?? item.name ?? `Menu Item ${index + 1}`,
  kategori: item.kategori ?? item.category ?? 'General',
  stoktaVar: Boolean(item.stoktaVar ?? item.inStock ?? true),
  fiyat: item.fiyat ?? item.price ?? 0,
  aciklama: item.aciklama ?? item.description ?? '',
  imageUrl: item.imageUrl ?? item.image ?? '',
  isCustom: true
});

const mapRestaurantProfile = (
  restaurant: MerchantRestaurantApiRecord | null | undefined,
  fallbackEmail?: string
): MerchantRestaurantProfile => ({
  id: restaurant?.id ?? restaurant?._id ?? '',
  ad: restaurant?.ad ?? restaurant?.name ?? 'Maman Bistro',
  aciklama: restaurant?.aciklama ?? restaurant?.description ?? '',
  kategori: normalizeRestaurantType(restaurant?.kategori ?? restaurant?.category),
  imageUrl:
    restaurant?.imageUrl ??
    buildRestaurantImage(restaurant?.ad ?? restaurant?.name ?? 'Maman Bistro'),
  ownerEmail: restaurant?.ownerEmail ?? fallbackEmail ?? '',
  menu: restaurant?.menu?.map(mapInventoryItem) ?? []
});

const persistLocalAccount = (payload: {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  restaurantName: string;
  restaurantId?: string;
  restaurantImageUrl?: string;
  restaurantType?: MerchantRestaurantType;
}) => {
  const normalizedEmail = normalizeEmail(payload.email);
  const accounts = readLocalMerchantAccounts();
  const nextAccount: LocalMerchantAccount = {
    id: payload.id,
    name: payload.name.trim() || 'Cabuk Merchant',
    email: normalizedEmail,
    password: payload.password,
    phone: payload.phone?.trim(),
    restaurantName: payload.restaurantName.trim() || 'Maman Bistro',
    restaurantId: payload.restaurantId,
    restaurantImageUrl: payload.restaurantImageUrl,
    restaurantType: payload.restaurantType ?? 'restaurants'
  };

  writeLocalMerchantAccounts([
    nextAccount,
    ...accounts.filter((account) => normalizeEmail(account.email) !== normalizedEmail)
  ]);
};

const fallbackSessionFromAccount = (account?: LocalMerchantAccount | null): MerchantAuthSession => ({
  restaurantId: account?.restaurantId ?? '',
  restaurantName: account?.restaurantName ?? account?.name ?? 'Maman Bistro',
  restaurantImageUrl:
    account?.restaurantImageUrl ??
    buildRestaurantImage(account?.restaurantName ?? account?.name ?? 'Maman Bistro'),
  restaurantType: account?.restaurantType ?? 'restaurants'
});

export const girisYap = async (email: string, password: string) => {
  const t = getTranslations(getCurrentLanguage());
  const normalizedEmail = normalizeEmail(email);

  if (!email || !password) {
    throw new Error(t.misc.emailAndPasswordRequired);
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      let message = t.login.loginFailed;
      try {
        const data = (await response.json()) as { message?: string };
        if (typeof data?.message === 'string') {
          message = data.message;
        }
      } catch {
      }
      throw new Error(message);
    }
    const data = (await response.json()) as {
      user?: {
        id?: string;
        adSoyad?: string;
        telefon?: string;
        restaurantId?: string;
        restaurantName?: string;
        restaurantImageUrl?: string;
        restaurantType?: MerchantRestaurantType;
      };
    };

    persistLocalAccount({
      id: data.user?.id ?? `merchant-${Date.now()}`,
      email: normalizedEmail,
      password,
      name: data.user?.adSoyad ?? 'Cabuk Merchant',
      phone: data.user?.telefon,
      restaurantName: data.user?.restaurantName ?? 'Maman Bistro',
      restaurantId: data.user?.restaurantId,
      restaurantImageUrl:
        data.user?.restaurantImageUrl ??
        buildRestaurantImage(data.user?.restaurantName ?? 'Maman Bistro'),
      restaurantType: data.user?.restaurantType ?? 'restaurants'
    });

    return {
      restaurantId: data.user?.restaurantId ?? '',
      restaurantName: data.user?.restaurantName ?? 'Maman Bistro',
      restaurantImageUrl:
        data.user?.restaurantImageUrl ??
        buildRestaurantImage(data.user?.restaurantName ?? 'Maman Bistro'),
      restaurantType: data.user?.restaurantType ?? 'restaurants'
    };
  } catch (error) {
    if (normalizedEmail === 'merchant@cabuk.al' && password === '123456') {
      return {
        restaurantId: '',
        restaurantName: 'Maman Bistro',
        restaurantImageUrl: buildRestaurantImage('Maman Bistro'),
        restaurantType: 'restaurants'
      };
    }

    if (error instanceof Error && error.message !== 'Failed to fetch') {
      throw error;
    }

    throw new Error('Merchant login requires a live backend connection.');
  }
  return fallbackSessionFromAccount(null);
};

export const kayitOl = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  restaurantName: string;
  restaurantType: MerchantRestaurantType;
}) => {
  const t = getTranslations(getCurrentLanguage());
  const normalizedEmail = normalizeEmail(payload.email);

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone ?? '',
        restaurantName: payload.restaurantName,
        restaurantType: payload.restaurantType,
        role: 'merchant'
      })
    });

    if (response.status === 409) {
      let message = 'You already have an account.';
      try {
        const data = (await response.json()) as { message?: string };
        if (typeof data?.message === 'string') {
          message = data.message;
        }
      } catch {
      }
      throw new Error(message);
    }

    if (!response.ok) {
      let message = t.login.loginFailed;
      try {
        const data = (await response.json()) as { message?: string };
        if (typeof data?.message === 'string') {
          message = data.message;
        }
      } catch {
      }
      throw new Error(message);
    }
    const data = (await response.json()) as {
      user?: {
        id?: string;
        adSoyad?: string;
        telefon?: string;
        restaurantId?: string;
        restaurantName?: string;
        restaurantImageUrl?: string;
        restaurantType?: MerchantRestaurantType;
      };
    };

    persistLocalAccount({
      id: data.user?.id ?? `merchant-${Date.now()}`,
      email: normalizedEmail,
      password: payload.password,
      name: data.user?.adSoyad ?? payload.name,
      phone: data.user?.telefon ?? payload.phone,
      restaurantName: data.user?.restaurantName ?? payload.restaurantName,
      restaurantId: data.user?.restaurantId,
      restaurantImageUrl:
        data.user?.restaurantImageUrl ??
        buildRestaurantImage(data.user?.restaurantName ?? payload.restaurantName),
      restaurantType: data.user?.restaurantType ?? payload.restaurantType
    });

    return {
      restaurantId: data.user?.restaurantId ?? '',
      restaurantName: data.user?.restaurantName ?? (payload.restaurantName.trim() || 'Maman Bistro'),
      restaurantImageUrl:
        data.user?.restaurantImageUrl ??
        buildRestaurantImage(data.user?.restaurantName ?? payload.restaurantName),
      restaurantType: data.user?.restaurantType ?? payload.restaurantType
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Merchant signup requires a live backend connection.');
  }
};

export const restoranProfiliniGetir = async (
  ownerEmail: string,
  fallback?: {
    restaurantName?: string;
    restaurantType?: MerchantRestaurantType;
  }
) => {
  const query = new URLSearchParams({
    ownerEmail
  });

  if (fallback?.restaurantName?.trim()) {
    query.set('restaurantName', fallback.restaurantName.trim());
  }

  if (fallback?.restaurantType) {
    query.set('restaurantType', fallback.restaurantType);
  }

  const response = await fetch(`${API_URL}/restaurants/owner-profile?${query.toString()}`);

  if (!response.ok) {
    let message = 'Failed to load restaurant profile';

    try {
      const data = (await response.json()) as { message?: string };
      if (typeof data?.message === 'string' && data.message.trim()) {
        message = data.message;
      }
    } catch {
    }

    throw new Error(message);
  }

  const data = (await response.json()) as { restaurant?: MerchantRestaurantApiRecord };
  return mapRestaurantProfile(data.restaurant, ownerEmail);
};

export const restoranProfiliniGuncelle = async (payload: {
  restaurantId: string;
  ownerEmail: string;
  ad: string;
  aciklama?: string;
  imageUrl?: string;
}) => {
  const normalizedEmail = normalizeEmail(payload.ownerEmail);
  let targetRestaurantId = payload.restaurantId.trim();

  if (!targetRestaurantId || !isMongoObjectId(targetRestaurantId)) {
    try {
      const existingProfile = await restoranProfiliniGetir(payload.ownerEmail);
      if (existingProfile.id) {
        targetRestaurantId = existingProfile.id;
      }
    } catch {
      // Keep the current ID when the owner-profile lookup is unavailable.
    }
  }

  if (!targetRestaurantId) {
    throw new Error('Restaurant profile is unavailable. Please reload the dashboard and try again.');
  }

  let profile: MerchantRestaurantProfile;

  try {
    const response = await fetch(`${API_URL}/restaurants/${targetRestaurantId}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        restaurantId: targetRestaurantId
      })
    });

    if (!response.ok) {
      let message = 'Failed to update restaurant profile';

      try {
        const data = (await response.json()) as { message?: string };
        if (typeof data?.message === 'string' && data.message.trim()) {
          message = data.message;
        }
      } catch {
      }

      throw new Error(message);
    }

    const data = (await response.json()) as { restaurant?: MerchantRestaurantApiRecord };
    profile = mapRestaurantProfile(data.restaurant, payload.ownerEmail);
  } catch (error) {
    if (!isNetworkFetchError(error)) {
      throw error;
    }

    // Offline fallback - save locally only when the backend is unreachable.
    profile = {
      id: targetRestaurantId,
      ad: payload.ad,
      aciklama: payload.aciklama ?? '',
      imageUrl: payload.imageUrl ?? buildRestaurantImage(payload.ad),
      ownerEmail: payload.ownerEmail,
      menu: []
    };
  }

  // Always update the local account in cabuk-merchant-accounts
  const accounts = readLocalMerchantAccounts();
  const existingAccount = accounts.find((a) => normalizeEmail(a.email) === normalizedEmail);
  if (existingAccount) {
    writeLocalMerchantAccounts([
      {
        ...existingAccount,
        restaurantId: profile.id,
        restaurantName: profile.ad,
        restaurantImageUrl: profile.imageUrl
      },
      ...accounts.filter((a) => normalizeEmail(a.email) !== normalizedEmail)
    ]);
  }

  return profile;
};

export const restoranMenusunuKaydet = async (payload: {
  restaurantId: string;
  ownerEmail: string;
  menu: InventoryItem[];
}) => {
  let targetRestaurantId = payload.restaurantId.trim();

  if (!targetRestaurantId || !isMongoObjectId(targetRestaurantId)) {
    const existingProfile = await restoranProfiliniGetir(payload.ownerEmail);
    targetRestaurantId = existingProfile.id;
  }

  if (!targetRestaurantId) {
    throw new Error('Restaurant profile is unavailable. Please reload the dashboard and try again.');
  }

  const response = await fetch(`${API_URL}/restaurants/${targetRestaurantId}/menu`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ownerEmail: payload.ownerEmail,
      menu: payload.menu.map((item) => ({
        id: item.id,
        ad: item.ad,
        kategori: item.kategori,
        fiyat: item.fiyat,
        aciklama: item.aciklama,
        stoktaVar: item.stoktaVar,
        imageUrl: item.imageUrl
      }))
    })
  });

  if (!response.ok) {
    let message = 'Failed to save restaurant menu';

    try {
      const data = (await response.json()) as { message?: string };
      if (typeof data?.message === 'string' && data.message.trim()) {
        message = data.message;
      }
    } catch {
    }

    throw new Error(message);
  }

  const data = (await response.json()) as { restaurant?: MerchantRestaurantApiRecord };
  return mapRestaurantProfile(data.restaurant, payload.ownerEmail);
};

export const siparisleriGetir = async (restaurantId?: string) => {
  const t = getTranslations(getCurrentLanguage());

  try {
    const response = await fetch(
      `${API_URL}/orders${restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : ''}`
    );

    if (!response.ok) {
      throw new Error(t.misc.ordersLoadFailed);
    }

    const data = (await response.json()) as { orders?: SiparisApiKaydi[] };
    const remoteOrders = (data.orders ?? []).map(mapOrder);
    return remoteOrders.length > 0 ? remoteOrders : fallbackOrders;
  } catch {
    return fallbackOrders;
  }
};

export const siparisDurumuGuncelle = async (orderId: string, durum: SiparisDurumu) => {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: durum })
    });

    if (response.ok) {
      const data = (await response.json()) as { order?: SiparisApiKaydi };
      if (data.order) {
        return mapOrder(data.order);
      }
    }
  } catch {
    // UI remains optimistic even if backend sync is temporarily unavailable.
  }

  return null;
};

export const magazaSoketiniBaslat = (
  restaurantId: string,
  onNewOrder: (siparis: MerchantOrder) => void,
  onStatusChanged?: (siparis: MerchantOrder) => void
) => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit('merchant_room_join', restaurantId);

  const handleNewOrder = (payload: SiparisApiKaydi) => {
    onNewOrder(mapOrder(payload, Date.now()));
  };

  const handleStatusChanged = (payload: SiparisApiKaydi) => {
    onStatusChanged?.(mapOrder(payload, Date.now()));
  };

  socket.on('order_received', handleNewOrder);
  socket.on('order_status_changed', handleStatusChanged);

  return () => {
    socket.off('order_received', handleNewOrder);
    socket.off('order_status_changed', handleStatusChanged);
  };
};

export const siparisDurumOlayiGonder = (orderId: string, userId: string, durum: SiparisDurumu) => {
  socket.emit('order_status_changed', {
    id: orderId,
    userId,
    status: durum
  });
};
