import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../components/ScreenContainer';
import { getOrderStatusLabel, StatusBadge } from '../components/StatusBadge';
import {
  getApiErrorMessage,
  getOrders,
  isNetworkUnavailableError,
  listenOrderUpdates
} from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { Order } from '../types/models';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import { formatAddressSummary } from '../utils/address';
import { formatCurrency } from '../utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'OrdersTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const OrdersScreen = (_props: Props) => {
  const { t } = useTranslation();
  const localOrders = useAppStore((state) => state.orders);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const [orders, setOrders] = useState<Order[]>(localOrders);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const remoteOrders = await getOrders(currentUserId);

        if (!isMounted) {
          return;
        }

        setOrders(remoteOrders.length > 0 ? remoteOrders : localOrders);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setOrders(localOrders);

        if (!isNetworkUnavailableError(error)) {
          Alert.alert(t('common.siparisler'), getApiErrorMessage(error, t('errors.network')));
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, localOrders, t]);

  useEffect(() => {
    const unsubscribe = listenOrderUpdates(
      currentUserId,
      setOrders,
      (status) => {
        Alert.alert(
          t('common.siparisler'),
          t('orders.statusUpdated', { status: getOrderStatusLabel(status) })
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserId, t]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('common.siparisler')}</Text>
      <Text style={styles.subtitle}>{t('orders.baslik')}</Text>

      <View style={styles.list}>
        {orders.map((order) => (
          <Pressable
            key={order.id}
            style={styles.card}
            onPress={() => {
              _props.navigation.navigate('OrderDetails', { orderId: order.id });
            }}
          >
            <View style={styles.header}>
              <Text style={styles.restaurant}>
                {order.restaurantNameKey.includes('.')
                  ? t(order.restaurantNameKey)
                  : order.restaurantNameKey}
              </Text>
              <StatusBadge status={order.status} />
            </View>
            <Text style={styles.meta}>{order.createdAt}</Text>
            <Text style={styles.items}>
              {order.items
                .map((item) => `${item.quantity}x ${item.nameKey.includes('.') ? t(item.nameKey) : item.nameKey}`)
                .join(', ')}
            </Text>
            {order.deliveryAddress ? (
              <View style={styles.deliveryBlock}>
                <Text style={styles.deliveryLabel}>{t('orders.teslimatAdresi')}</Text>
                <Text style={styles.deliveryText}>{formatAddressSummary(order.deliveryAddress)}</Text>
              </View>
            ) : null}
            <Text style={styles.total}>{formatCurrency(order.total)}</Text>
          </Pressable>
        ))}
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
  subtitle: {
    color: colors.textMuted,
    lineHeight: 21,
  },
  list: {
    gap: 14,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  header: {
    gap: 10,
  },
  restaurant: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
  },
  items: {
    color: colors.text,
    lineHeight: 21,
  },
  deliveryBlock: {
    gap: 4,
  },
  deliveryLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
  },
  deliveryText: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  total: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '800',
  },
});
