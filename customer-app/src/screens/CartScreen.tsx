import React, { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppStore, calculateCartTotal } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import { formatAddressSummary, getSelectedAddress } from '../utils/address';
import { formatCurrency } from '../utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'CartTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const CartScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const cartItems = useAppStore((state) => state.cartItems);
  const activeRestaurantId = useAppStore((state) => state.activeRestaurantId);
  const addresses = useAppStore((state) => state.addresses);
  const selectedAddressId = useAppStore((state) => state.selectedAddressId);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const fetchAddresses = useAppStore((state) => state.fetchAddresses);
  const setCartItemQuantity = useAppStore((state) => state.setCartItemQuantity);
  const total = calculateCartTotal(cartItems);
  const selectedAddress = getSelectedAddress(addresses, selectedAddressId);

  useEffect(() => {
    void fetchAddresses();
  }, [currentUserId, fetchAddresses]);

  const openPayment = () => {
    if (cartItems.length === 0) {
      Alert.alert(t('common.sepet'), t('alerts.bosSepet'));
      return;
    }

    if (!selectedAddress) {
      Alert.alert(t('common.adresYonetimi'), t('alerts.adresGerekli'));
      return;
    }

    navigation.navigate('Payment');
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('common.sepet')}</Text>

      <View style={styles.deliveryCard}>
        <View style={styles.deliveryHeader}>
          <Text style={styles.deliveryTitle}>{t('cart.teslimatBaslik')}</Text>
          <PrimaryButton
            label={t('cart.adresDegistir')}
            onPress={() => navigation.navigate('Address')}
            variant="outline"
          />
        </View>
        {selectedAddress ? (
          <>
            <Text style={styles.deliveryBadge}>{t('cart.varsayilanTeslimat')}</Text>
            <Text style={styles.deliveryText}>{formatAddressSummary(selectedAddress)}</Text>
          </>
        ) : (
          <Text style={styles.deliveryText}>{t('cart.adresYok')}</Text>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('cart.bosBaslik')}</Text>
          <Text style={styles.emptyText}>{t('cart.bosMetin')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>
                {item.nameKey.includes('.') ? t(item.nameKey) : item.nameKey}
              </Text>
              <View style={styles.quantityRow}>
                <Pressable
                  onPress={() => setCartItemQuantity(item.id, item.restaurantId, item.quantity - 1)}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </Pressable>
                <Text style={styles.itemMeta}>
                  {t('cart.urunAdedi')}: {item.quantity}
                </Text>
                <Pressable
                  onPress={() => setCartItemQuantity(item.id, item.restaurantId, item.quantity + 1)}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.summary}>
        <Text style={styles.totalLabel}>{t('common.toplam')}</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        <Text style={styles.helper}>{t('cart.odemeAltMetin')}</Text>
        {activeRestaurantId ? (
          <PrimaryButton
            label={t('common.menuyeGit')}
            onPress={() => navigation.navigate('Restaurant', { restaurantId: activeRestaurantId })}
            variant="outline"
          />
        ) : null}
        <PrimaryButton
          label={t('common.ode')}
          onPress={openPayment}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  deliveryCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.surface,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deliveryHeader: {
    gap: 12,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  deliveryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.heroSoft,
    color: colors.hero,
    fontSize: 12,
    fontWeight: '800',
  },
  deliveryText: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  paymentCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.surface,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8F5F2',
    gap: 6,
  },
  paymentOptionActive: {
    borderColor: colors.hero,
    backgroundColor: '#FFF7F4',
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  paymentOptionTitleActive: {
    color: colors.hero,
  },
  paymentOptionText: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  paymentMeta: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  emptyState: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    color: colors.textMuted,
    lineHeight: 21,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  itemMeta: {
    color: colors.textMuted,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F5F2',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  itemPrice: {
    color: colors.accent,
    fontWeight: '700',
  },
  summary: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
