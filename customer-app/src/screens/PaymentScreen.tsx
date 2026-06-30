import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import {
  createOrder,
  createPaystackCheckout,
  createPendingOrder,
  getApiErrorMessage,
  verifyPaystackPayment
} from '../services/api';
import { calculateCartTotal, useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';
import { formatAddressSummary, getAddressCoordinates, getSelectedAddress } from '../utils/address';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const parseQueryParams = (url: string) => {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) {
    return {};
  }

  const queryString = url.slice(queryIndex + 1);
  return queryString.split('&').reduce<Record<string, string>>((acc, pair) => {
    const [rawKey, rawValue] = pair.split('=');
    if (!rawKey) {
      return acc;
    }

    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue ?? '');
    return acc;
  }, {});
};

export const PaymentScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const cartItems = useAppStore((state) => state.cartItems);
  const activeRestaurantId = useAppStore((state) => state.activeRestaurantId);
  const checkout = useAppStore((state) => state.checkout);
  const addresses = useAppStore((state) => state.addresses);
  const selectedAddressId = useAppStore((state) => state.selectedAddressId);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const currentUserEmail = useAppStore((state) => state.currentUserEmail);

  const total = useMemo(() => calculateCartTotal(cartItems), [cartItems]);
  const selectedAddress = getSelectedAddress(addresses, selectedAddressId);

  const pendingOrderIdRef = useRef<string | null>(null);
  const pendingTxRefRef = useRef<string | null>(null);
  const isVerifyingRef = useRef(false);
  const [isPaying, setIsPaying] = useState(false);

  const buildOrderPayload = (paymentStatus: 'pending' | 'paid', paymentTransactionId: string) => {
    const restaurantId = activeRestaurantId ?? cartItems[0]?.restaurantId ?? '';
    const deliveryLocation = getAddressCoordinates(selectedAddress);

    return {
      restaurantId,
      payload: {
        userId: currentUserId,
        restaurantId,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.nameKey.includes('.') ? t(item.nameKey) : item.nameKey,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        paymentMethod: 'card' as const,
        paymentStatus,
        paymentTransactionId,
        deliveryAddress: selectedAddress!,
        deliveryLocation
      }
    };
  };

  const completeSuccessfulPayment = async (transactionId: string) => {
    if (!selectedAddress) {
      Alert.alert(t('common.adresYonetimi'), t('alerts.adresGerekli'));
      return;
    }

    const { restaurantId, payload } = buildOrderPayload('paid', transactionId);
    if (!restaurantId) {
      Alert.alert(t('common.ode'), t('errors.network'));
      return;
    }

    const response = await createOrder(payload);
    const backendOrderId = response?.order?.id ?? response?.order?._id ?? '';

    checkout({
      paymentMethod: 'card',
      transactionId,
      backendOrderId,
      status: 'received'
    });

    Alert.alert(t('common.ode'), t('cart.odemeBasarili'));
    navigation.navigate('MainTabs');
  };

  const showTestModeOptions = (message?: string) => {
    Alert.alert(
      'Test mode',
      message ?? 'Flutterwave checkout is unavailable right now. Choose a simulated result.',
      [
        {
          text: 'Success',
          onPress: () => {
            void completeSuccessfulPayment(`flw_test_success_${Date.now()}`);
          }
        },
        {
          text: 'Failed',
          onPress: () => {
            Alert.alert(t('common.ode'), 'Error: Payment failed');
          }
        },
        {
          text: 'Cancelled',
          style: 'cancel',
          onPress: () => {
            Alert.alert(t('common.ode'), 'Payment cancelled');
          }
        }
      ]
    );
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      if (!pendingOrderIdRef.current) {
        return;
      }

      if (!url.startsWith('cabuk://checkout')) {
        return;
      }

      if (isVerifyingRef.current) {
        return;
      }

      isVerifyingRef.current = true;
      setIsPaying(true);

      try {
        const params = parseQueryParams(url);
        const status = (params.status ?? params.payment_status ?? '').toLowerCase();
        const txRef = params.tx_ref ?? params.txRef ?? pendingTxRefRef.current;

        if (status && status !== 'successful') {
          Alert.alert(t('common.ode'), `Error: Payment ${status}`);
          return;
        }

        if (!txRef) {
          Alert.alert(t('common.ode'), t('errors.network'));
          return;
        }

        const verifyResponse = await verifyPaystackPayment({
          orderId: pendingOrderIdRef.current,
          txRef,
          paymentMethod: 'card',
        });

        if (!verifyResponse.success) {
          Alert.alert(t('common.ode'), verifyResponse.message ?? t('errors.network'));
          return;
        }

        checkout({
          paymentMethod: 'card',
          transactionId: verifyResponse.transactionId,
          backendOrderId: pendingOrderIdRef.current,
          status: 'received',
        });

        Alert.alert(t('common.ode'), t('cart.odemeBasarili'));
        navigation.navigate('MainTabs');
      } catch (error) {
        Alert.alert(t('common.ode'), t('errors.network'));
      } finally {
        pendingOrderIdRef.current = null;
        pendingTxRefRef.current = null;
        isVerifyingRef.current = false;
        setIsPaying(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkout, navigation, t]);

  const startPaystackPayment = async () => {
    if (isPaying) {
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert(t('common.sepet'), t('alerts.bosSepet'));
      return;
    }

    if (!selectedAddress) {
      Alert.alert(t('common.adresYonetimi'), t('alerts.adresGerekli'));
      return;
    }

    const restaurantId = activeRestaurantId ?? cartItems[0]?.restaurantId ?? '';

    if (!restaurantId) {
      Alert.alert(t('common.ode'), t('errors.network'));
      return;
    }

    setIsPaying(true);

    try {
      const { payload } = buildOrderPayload('pending', '');
      const pendingOrderResponse = await createPendingOrder(payload);

      const backendOrderId =
        pendingOrderResponse.order.id ?? pendingOrderResponse.order._id ?? '';

      if (!backendOrderId) {
        throw new Error('Missing backend order id');
      }

      pendingOrderIdRef.current = backendOrderId;

      const paymentResponse = await createPaystackCheckout({
        orderId: backendOrderId,
        amount: total,
        currency: 'GBP',
        paymentMethod: 'card',
        email: currentUserEmail,
        redirectUrl: 'cabuk://checkout',
        metadata: { orderId: backendOrderId },
      });

      if (!paymentResponse.checkoutUrl) {
        throw new Error('Missing checkout url');
      }

      pendingTxRefRef.current = paymentResponse.txRef ?? null;
      await Linking.openURL(paymentResponse.checkoutUrl);
    } catch (error) {
      pendingOrderIdRef.current = null;
      pendingTxRefRef.current = null;
      setIsPaying(false);
      showTestModeOptions(getApiErrorMessage(error, t('errors.network')));
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('common.ode')}</Text>
      <Text style={styles.subtitle}>{t('cart.odemeAltMetin')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('common.toplam')}</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
        {selectedAddress ? (
          <>
            <Text style={styles.cardTitle}>{t('cart.teslimatBaslik')}</Text>
            <Text style={styles.address}>{formatAddressSummary(selectedAddress)}</Text>
          </>
        ) : null}
      </View>

      {__DEV__ ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Flutterwave Test Cards</Text>
          <Text style={styles.testLine}>Successful (Mastercard): 5531886652142950</Text>
          <Text style={styles.testLine}>Expiry: 09/32 • CVV: 564 • PIN: 3310 • OTP: 12345</Text>
          <Text style={styles.testLine}>Failed (Insufficient funds): 5258585922666506</Text>
          <Text style={styles.testLine}>Expiry: 09/31 • CVV: 883 • PIN: 3310 • OTP: 12345</Text>
          <Text style={styles.testLine}>Failed (Fraudulent): 5590131743294314</Text>
          <Text style={styles.testLine}>Expiry: 11/32 • CVV: 887 • PIN: 3310 • OTP: 12345</Text>
          <PrimaryButton
            label="Test Success"
            onPress={() => {
              void completeSuccessfulPayment(`flw_test_success_${Date.now()}`);
            }}
          />
          <PrimaryButton
            label="Test Failed"
            variant="outline"
            onPress={() => {
              Alert.alert(t('common.ode'), 'Error: Payment failed');
            }}
          />
        </View>
      ) : null}

      <PrimaryButton
        label={isPaying ? t('cart.odemeIsleniyor') : t('common.ode')}
        onPress={() => {
          void startPaystackPayment();
        }}
      />
      <PrimaryButton
        label={t('common.iptal')}
        onPress={() => navigation.goBack()}
        variant="outline"
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 21,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  cardTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  total: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  address: {
    color: colors.text,
    lineHeight: 22,
  },
  testLine: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});
