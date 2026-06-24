import { useMemo } from 'react';
import { create } from 'zustand';

import type { InventoryItem, MerchantNotification, MerchantOrder, SiparisDurumu } from '../types';
import { hesaplaFinansalOzet } from '../utils/merchant';
import type { AppLanguage } from '../utils/i18n';

type MerchantState = {
  isAuthenticated: boolean;
  merchantEmail: string;
  language: AppLanguage;
  orders: MerchantOrder[];
  notifications: MerchantNotification[];
  inventory: InventoryItem[];
  girisYap: (email: string) => void;
  cikisYap: () => void;
  setLanguage: (language: AppLanguage) => void;
  setOrders: (orders: MerchantOrder[]) => void;
  yeniSiparisEkle: (order: MerchantOrder) => void;
  siparisDurumuGuncelle: (orderId: string, durum: SiparisDurumu) => void;
  addNotification: (notification: MerchantNotification) => void;
  markAllNotificationsRead: () => void;
  stokDurumuDegistir: (itemId: string) => void;
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

const initialInventory: InventoryItem[] = [
  { id: 'inv-1', ad: 'Byrek', stoktaVar: true, kategori: 'Bakery' },
  { id: 'inv-2', ad: 'Tave Kosi', stoktaVar: true, kategori: 'Main Dish' },
  { id: 'inv-3', ad: 'Trilece', stoktaVar: true, kategori: 'Dessert' },
  { id: 'inv-4', ad: 'Qofte', stoktaVar: false, kategori: 'Snack' }
];

export const useMerchantStore = create<MerchantState>((set) => ({
  isAuthenticated: false,
  merchantEmail: '',
  language: getInitialLanguage(),
  orders: [],
  notifications: [],
  inventory: initialInventory,
  girisYap: (email) => {
    set({ isAuthenticated: true, merchantEmail: email });
  },
  cikisYap: () => {
    set({ isAuthenticated: false, merchantEmail: '' });
  },
  setLanguage: (language) => {
    persistLanguage(language);
    set({ language });
  },
  setOrders: (orders) => {
    set({ orders });
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
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === itemId ? { ...item, stoktaVar: !item.stoktaVar } : item
      )
    }));
  }
}));

export const useFinansalOzet = () =>
  {
    const orders = useMerchantStore((state) => state.orders);
    return useMemo(() => hesaplaFinansalOzet(orders), [orders]);
  };
