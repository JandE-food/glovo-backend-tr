import { useMemo } from 'react';
import { create } from 'zustand';

import type { InventoryItem, MerchantNotification, MerchantOrder, SiparisDurumu } from '../types';
import { hesaplaFinansalOzet } from '../utils/merchant';
import type { AppLanguage } from '../utils/i18n';

type MerchantState = {
  isAuthenticated: boolean;
  merchantEmail: string;
  merchantRestaurantId: string;
  merchantRestaurantName: string;
  merchantRestaurantImageUrl: string;
  language: AppLanguage;
  orders: MerchantOrder[];
  notifications: MerchantNotification[];
  inventory: InventoryItem[];
  girisYap: (payload: {
    email: string;
    restaurantId?: string;
    restaurantName?: string;
    restaurantImageUrl?: string;
  }) => void;
  cikisYap: () => void;
  setLanguage: (language: AppLanguage) => void;
  setOrders: (orders: MerchantOrder[]) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setRestaurantProfile: (payload: { restaurantId?: string; restaurantName?: string; restaurantImageUrl?: string }) => void;
  yeniSiparisEkle: (order: MerchantOrder) => void;
  updateOrder: (order: MerchantOrder) => void;
  siparisDurumuGuncelle: (orderId: string, durum: SiparisDurumu) => void;
  addNotification: (notification: MerchantNotification) => void;
  markAllNotificationsRead: () => void;
  stokDurumuDegistir: (itemId: string) => void;
  menuItemEkle: (item: {
    ad: string;
    kategori: string;
    fiyat?: number;
    aciklama?: string;
    imageUrl?: string;
  }) => void;
  menuItemGuncelle: (itemId: string, item: {
    ad: string;
    kategori: string;
    fiyat?: number;
    aciklama?: string;
    imageUrl?: string;
  }) => void;
  menuItemSil: (itemId: string) => void;
};

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return 'sq';
  }

  const savedLanguage = window.localStorage.getItem('cabuk-merchant-language');
  return savedLanguage === 'en' || savedLanguage === 'sq' || savedLanguage === 'sr'
    ? savedLanguage
    : 'sq';
};

const persistLanguage = (language: AppLanguage) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cabuk-merchant-language', language);
  }
};

const MERCHANT_SESSION_KEY = 'cabuk-merchant-session';
const getInitialMerchantSession = () => {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      merchantEmail: '',
      merchantRestaurantId: '',
      merchantRestaurantName: 'Maman Bistro',
      merchantRestaurantImageUrl: ''
    };
  }

  const rawValue = window.localStorage.getItem(MERCHANT_SESSION_KEY);
  if (!rawValue) {
    return {
      isAuthenticated: false,
      merchantEmail: '',
      merchantRestaurantId: '',
      merchantRestaurantName: 'Maman Bistro',
      merchantRestaurantImageUrl: ''
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as {
      isAuthenticated?: boolean;
      merchantEmail?: string;
      merchantRestaurantId?: string;
      merchantRestaurantName?: string;
      merchantRestaurantImageUrl?: string;
    };
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      merchantEmail: parsed.merchantEmail ?? '',
      merchantRestaurantId: parsed.merchantRestaurantId ?? '',
      merchantRestaurantName: parsed.merchantRestaurantName?.trim() || 'Maman Bistro',
      merchantRestaurantImageUrl: parsed.merchantRestaurantImageUrl ?? ''
    };
  } catch {
    return {
      isAuthenticated: false,
      merchantEmail: '',
      merchantRestaurantId: '',
      merchantRestaurantName: 'Maman Bistro',
      merchantRestaurantImageUrl: ''
    };
  }
};

const persistMerchantSession = (payload: {
  isAuthenticated: boolean;
  merchantEmail: string;
  merchantRestaurantId: string;
  merchantRestaurantName: string;
  merchantRestaurantImageUrl: string;
}) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(MERCHANT_SESSION_KEY, JSON.stringify(payload));
};

const clearMerchantSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(MERCHANT_SESSION_KEY);
};

export const useMerchantStore = create<MerchantState>((set) => ({
  ...getInitialMerchantSession(),
  language: getInitialLanguage(),
  orders: [],
  notifications: [],
  inventory: [],
  girisYap: ({ email, restaurantId, restaurantName, restaurantImageUrl }) => {
    const nextRestaurantName = restaurantName?.trim() || 'Maman Bistro';
    persistMerchantSession({
      isAuthenticated: true,
      merchantEmail: email,
      merchantRestaurantId: restaurantId ?? '',
      merchantRestaurantName: nextRestaurantName,
      merchantRestaurantImageUrl: restaurantImageUrl ?? ''
    });
    set({
      isAuthenticated: true,
      merchantEmail: email,
      merchantRestaurantId: restaurantId ?? '',
      merchantRestaurantName: nextRestaurantName,
      merchantRestaurantImageUrl: restaurantImageUrl ?? ''
    });
  },
  cikisYap: () => {
    clearMerchantSession();
    set({
      isAuthenticated: false,
      merchantEmail: '',
      merchantRestaurantId: '',
      merchantRestaurantName: 'Maman Bistro',
      merchantRestaurantImageUrl: '',
      inventory: [],
      orders: []
    });
  },
  setLanguage: (language) => {
    persistLanguage(language);
    set({ language });
  },
  setOrders: (orders) => {
    set({ orders });
  },
  setInventory: (inventory) => {
    set({ inventory });
  },
  setRestaurantProfile: ({ restaurantId, restaurantName, restaurantImageUrl }) => {
    set((state) => {
      const nextState = {
        merchantRestaurantId: restaurantId ?? state.merchantRestaurantId,
        merchantRestaurantName: restaurantName?.trim() || state.merchantRestaurantName,
        merchantRestaurantImageUrl: restaurantImageUrl ?? state.merchantRestaurantImageUrl
      };

      persistMerchantSession({
        isAuthenticated: state.isAuthenticated,
        merchantEmail: state.merchantEmail,
        merchantRestaurantId: nextState.merchantRestaurantId,
        merchantRestaurantName: nextState.merchantRestaurantName,
        merchantRestaurantImageUrl: nextState.merchantRestaurantImageUrl
      });

      return nextState;
    });
  },
  yeniSiparisEkle: (order) => {
    set((state) => {
      const mevcutSiparis = state.orders.find((entry) => entry.id === order.id);

      if (mevcutSiparis) {
        return {
          orders: state.orders.map((entry) => (entry.id === order.id ? order : entry))
        };
      }

      return { orders: [order, ...state.orders] };
    });
  },
  updateOrder: (order) => {
    set((state) => ({
      orders: state.orders.some((entry) => entry.id === order.id)
        ? state.orders.map((entry) => (entry.id === order.id ? order : entry))
        : [order, ...state.orders]
    }));
  },
  siparisDurumuGuncelle: (orderId, durum) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, durum } : order
      )
    }));
  },
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications.filter((entry) => entry.id !== notification.id)]
    }));
  },
  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true
      }))
    }));
  },
  stokDurumuDegistir: (itemId) => {
    set((state) => {
      const inventory = state.inventory.map((item) =>
        item.id === itemId ? { ...item, stoktaVar: !item.stoktaVar } : item
      );
      return { inventory };
    });
  },
  menuItemEkle: (item) => {
    set((state) => {
      const inventory = [
        {
          id: `inv-${Date.now()}`,
          ad: item.ad.trim(),
          kategori: item.kategori.trim(),
          stoktaVar: true,
          fiyat: item.fiyat,
          aciklama: item.aciklama?.trim(),
          imageUrl: item.imageUrl?.trim(),
          isCustom: true
        },
        ...state.inventory
      ];
      return { inventory };
    });
  },
  menuItemGuncelle: (itemId, item) => {
    set((state) => {
      const inventory = state.inventory.map((entry) =>
        entry.id === itemId
          ? {
              ...entry,
              ad: item.ad.trim(),
              kategori: item.kategori.trim(),
              fiyat: item.fiyat,
              aciklama: item.aciklama?.trim(),
              imageUrl: item.imageUrl?.trim()
            }
          : entry
      );
      return { inventory };
    });
  },
  menuItemSil: (itemId) => {
    set((state) => {
      const inventory = state.inventory.filter((entry) => entry.id !== itemId);
      return { inventory };
    });
  }
}));

export const useFinansalOzet = () =>
  {
    const orders = useMerchantStore((state) => state.orders);
    return useMemo(() => hesaplaFinansalOzet(orders), [orders]);
  };
