import type { MerchantOrder, SiparisDurumu } from '../types';
import { API_URL, socket } from './socket';
import { getTranslations, type AppLanguage } from '../utils/i18n';

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

  return window.localStorage.getItem('cabuk-merchant-language') === 'en' ? 'en' : 'sq';
};

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
    olusturmaSaati: new Date(siparis.createdAt ?? Date.now()).toLocaleTimeString(
      language === 'sq' ? 'sq-AL' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  };
};

export const girisYap = async (email: string, password: string) => {
  const t = getTranslations(getCurrentLanguage());

  if (!email || !password) {
    throw new Error(t.misc.emailAndPasswordRequired);
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    // Keep demo login usable if the merchant auth endpoint is not deployed yet.
    if (response.status === 404 || response.status >= 500) {
      return;
    }

    if (!response.ok) {
      throw new Error(t.login.loginFailed);
    }
  } catch (error) {
    if (error instanceof Error && error.message === t.login.loginFailed) {
      throw error;
    }

    // Network failures should not block local dashboard demo access.
  }
};

export const kayitOl = async (payload: { name: string; email: string; password: string; phone?: string }) => {
  const t = getTranslations(getCurrentLanguage());
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone ?? '',
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
};

export const siparisleriGetir = async () => {
  const t = getTranslations(getCurrentLanguage());

  try {
    const response = await fetch(`${API_URL}/orders`);

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
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: durum })
    });
  } catch {
    // UI remains optimistic even if backend sync is temporarily unavailable.
  }
};

export const magazaSoketiniBaslat = (
  onNewOrder: (siparis: MerchantOrder) => void,
  onStatusChanged?: (siparis: MerchantOrder) => void
) => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit('merchant_room_join');

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
