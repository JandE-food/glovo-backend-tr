import { create } from 'zustand';

import i18n from '../i18n';
import { restaurants } from '../data/mockData';
import { DEFAULT_USER_ID, api, getAddresses, saveAddress } from '../services/api';
import { getSelectedAddress, getSelectedAddressId } from '../utils/address';
import type {
  Address,
  AddressPayload,
  AppLanguage,
  CartItem,
  MenuItem,
  Order,
  PaymentMethod,
} from '../types/models';

export const calculateCartTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

type AppState = {
  cartItems: CartItem[];
  activeRestaurantId: string | null;
  orders: Order[];
  addresses: Address[];
  selectedAddressId: string | null;
  isAddressLoading: boolean;
  currentUserId: string;
  currentUserEmail: string;
  language: AppLanguage;
  addToCart: (item: MenuItem, restaurantId: string) => {
    ok: boolean;
    reason?: 'different_restaurant';
    currentRestaurantId?: string;
  };
  setCartItemQuantity: (itemId: string, restaurantId: string, quantity: number) => void;
  clearCart: () => void;
  setSession: (payload: { userId?: string; email?: string }) => void;
  setLanguage: (language: AppLanguage) => Promise<void>;
  checkout: (payment?: {
    paymentMethod: PaymentMethod;
    transactionId: string;
    backendOrderId?: string;
    status?: Order['status'];
  }) => boolean;
  fetchAddresses: () => Promise<void>;
  createAddress: (payload: AddressPayload) => Promise<Address>;
  updateAddress: (addressId: string, payload: AddressPayload) => Promise<Address>;
  deleteAddress: (addressId: string) => Promise<void>;
  selectAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => Promise<void>;
};

const resolveUserId = (payload?: { userId?: string; email?: string }) =>
  payload?.userId && payload.userId.length > 0
    ? payload.userId
    : payload?.email && payload.email.length > 0
      ? payload.email
      : DEFAULT_USER_ID;

const initialOrders: Order[] = [
  {
    id: 'order-1',
    restaurantNameKey: restaurants[0].nameKey,
    items: [
      {
        id: 'm3',
        restaurantId: 'r1',
        nameKey: 'menu.kunefe.name',
        descriptionKey: 'menu.kunefe.description',
        price: 60,
        quantity: 1,
        restaurantNameKey: restaurants[0].nameKey
      }
    ],
    total: 60,
    status: 'delivered',
    createdAt: 'Today, 13:40'
  },
  {
    id: 'order-2',
    restaurantNameKey: restaurants[2].nameKey,
    items: [
      {
        id: 'm2',
        restaurantId: 'r3',
        nameKey: 'menu.pide.name',
        descriptionKey: 'menu.pide.description',
        price: 45,
        quantity: 2,
        restaurantNameKey: restaurants[2].nameKey
      }
    ],
    total: 90,
    status: 'approaching',
    createdAt: 'Yesterday, 20:15'
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  cartItems: [],
  activeRestaurantId: null,
  orders: initialOrders,
  addresses: [],
  selectedAddressId: null,
  isAddressLoading: false,
  currentUserId: DEFAULT_USER_ID,
  currentUserEmail: `${DEFAULT_USER_ID}@cabuk.com`,
  language: 'sq',
  addToCart: (item, restaurantId) => {
    const restaurant = restaurants.find((entry) => entry.id === restaurantId);
    const restaurantNameKey = restaurant?.nameKey ?? restaurants[0].nameKey;
    const currentRestaurantId = get().activeRestaurantId;

    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      return {
        ok: false,
        reason: 'different_restaurant',
        currentRestaurantId
      };
    }

    set((state) => {
      const existingItem = state.cartItems.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return {
          activeRestaurantId: state.activeRestaurantId ?? restaurantId,
          cartItems: state.cartItems.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        };
      }

      return {
        activeRestaurantId: state.activeRestaurantId ?? restaurantId,
        cartItems: [...state.cartItems, { ...item, quantity: 1, restaurantNameKey }]
      };
    });

    return { ok: true };
  },
  setCartItemQuantity: (itemId, restaurantId, quantity) => {
    const nextQuantity = Math.max(0, Math.floor(quantity));

    set((state) => {
      if (state.activeRestaurantId && state.activeRestaurantId !== restaurantId) {
        return state;
      }

      const nextItems =
        nextQuantity === 0
          ? state.cartItems.filter((item) => item.id !== itemId)
          : state.cartItems.map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item));

      return {
        cartItems: nextItems,
        activeRestaurantId: nextItems.length === 0 ? null : state.activeRestaurantId ?? restaurantId
      };
    });
  },
  clearCart: () => set({ cartItems: [], activeRestaurantId: null }),
  setSession: ({ userId, email }) => {
    const nextUserId = resolveUserId({ userId, email });
    const nextUserEmail = email && email.length > 0 ? email : `${nextUserId}@cabuk.com`;

    set((state) => ({
      currentUserId: nextUserId,
      currentUserEmail: nextUserEmail,
      cartItems: state.currentUserId === nextUserId ? state.cartItems : [],
      activeRestaurantId: state.currentUserId === nextUserId ? state.activeRestaurantId : null,
      orders: state.currentUserId === nextUserId ? state.orders : [],
      addresses: state.currentUserId === nextUserId ? state.addresses : [],
      selectedAddressId: state.currentUserId === nextUserId ? state.selectedAddressId : null
    }));
  },
  setLanguage: async (language) => {
    await i18n.changeLanguage(language);
    set({ language });
  },
  checkout: (payment) => {
    const currentItems = get().cartItems;
    const selectedAddress = getSelectedAddress(get().addresses, get().selectedAddressId);

    if (currentItems.length === 0) {
      return false;
    }

    if (!selectedAddress) {
      return false;
    }

    const total = calculateCartTotal(currentItems);
    const restaurantNameKey = currentItems[0].restaurantNameKey;

    set((state) => ({
      cartItems: [],
      activeRestaurantId: null,
      orders: [
        {
          id: `order-${Date.now()}`,
          restaurantNameKey,
          items: currentItems,
          total,
          status: payment?.status ?? 'received',
          createdAt: 'Just now',
          deliveryAddress: selectedAddress,
          paymentMethod: payment?.paymentMethod,
          paymentTransactionId: payment?.transactionId,
          backendOrderId: payment?.backendOrderId
        },
        ...state.orders
      ]
    }));
    return true;
  },
  fetchAddresses: async () => {
    set({ isAddressLoading: true });

    try {
      const userId = get().currentUserId;
      const addresses = await getAddresses(userId);

      set({
        addresses,
        selectedAddressId: getSelectedAddressId(
          addresses,
          get().selectedAddressId
        ),
        isAddressLoading: false
      });
    } catch {
      set({ isAddressLoading: false });
    }
  },
  createAddress: async (payload) => {
    const nextAddress = await saveAddress({
      ...payload,
      userId: payload.userId ?? get().currentUserId
    });

    set((state) => ({
      addresses: [
        nextAddress,
        ...state.addresses
          .filter((address) => address.id !== nextAddress.id)
          .map((address) =>
            nextAddress.isDefault ? { ...address, isDefault: false } : address
          )
      ],
      selectedAddressId: nextAddress.isDefault ? nextAddress.id : state.selectedAddressId ?? nextAddress.id
    }));

    return nextAddress;
  },
  updateAddress: async (addressId, payload) => {
    const response = await api.patch<{ address: Address }>(`/addresses/${addressId}`, payload);
    const updatedAddress = response.data.address;

    set((state) => ({
      addresses: state.addresses.map((address) => {
        if (address.id === updatedAddress.id) {
          return updatedAddress;
        }

        return updatedAddress.isDefault ? { ...address, isDefault: false } : address;
      }),
      selectedAddressId:
        state.selectedAddressId === updatedAddress.id || updatedAddress.isDefault
          ? updatedAddress.id
          : state.selectedAddressId
    }));

    return updatedAddress;
  },
  deleteAddress: async (addressId) => {
    const userId = get().currentUserId;

    await api.delete(`/addresses/${addressId}`, {
      params: { userId }
    });

    set((state) => {
      const deletedAddress = state.addresses.find((address) => address.id === addressId);
      let remainingAddresses = state.addresses.filter((address) => address.id !== addressId);

      if (
        deletedAddress?.isDefault &&
        remainingAddresses.length > 0 &&
        !remainingAddresses.some((address) => address.isDefault)
      ) {
        const nextDefaultId = remainingAddresses[0].id;
        remainingAddresses = remainingAddresses.map((address) => ({
          ...address,
          isDefault: address.id === nextDefaultId
        }));
      }

      const preservedSelectedAddressId =
        state.selectedAddressId === addressId ? null : state.selectedAddressId;

      return {
        addresses: remainingAddresses,
        selectedAddressId: getSelectedAddressId(
          remainingAddresses,
          preservedSelectedAddressId
        )
      };
    });
  },
  selectAddress: (addressId) => {
    set({ selectedAddressId: addressId });
  },
  setDefaultAddress: async (addressId) => {
    const currentAddress = get().addresses.find((address) => address.id === addressId);

    if (!currentAddress) {
      return;
    }

    const response = await api.patch<{ address: Address }>(`/addresses/${addressId}`, {
      userId: currentAddress.userId ?? get().currentUserId,
      mahalle: currentAddress.mahalle,
      sokak: currentAddress.sokak,
      apartmanNo: currentAddress.apartmanNo,
      kat: currentAddress.kat,
      daire: currentAddress.daire,
      postaKodu: currentAddress.postaKodu,
      isDefault: true
    });

    const updatedAddress = response.data.address;

    set((state) => ({
      addresses: state.addresses.map((address) =>
        address.id === updatedAddress.id
          ? updatedAddress
          : { ...address, isDefault: false }
      ),
      selectedAddressId: updatedAddress.id
    }));
  }
}));
