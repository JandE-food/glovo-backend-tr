import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrderMap } from '../components/OrderMap';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../components/ScreenContainer';
import {
  getApiErrorMessage,
  getOrders,
  listenDriverLocation,
  type DriverLocation
} from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { Order } from '../types/models';
import type { RootStackParamList } from '../types/navigation';
import { formatAddressSummary } from '../utils/address';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

type Coordinate = {
  latitude: number;
  longitude: number;
};

const neighborhoodCoordinates: Record<string, Coordinate> = {
  blloku: { latitude: 41.3194, longitude: 19.8156 },
  'komuna e parisit': { latitude: 41.3095, longitude: 19.8018 },
  'pazari i ri': { latitude: 41.3314, longitude: 19.8249 },
  'don bosko': { latitude: 41.3442, longitude: 19.7941 },
  'liqeni i thate': { latitude: 41.3049, longitude: 19.7993 },
  '21 dhjetori': { latitude: 41.3201, longitude: 19.7928 }
};

const restaurantCoordinateByName = (restaurantName: string): Coordinate => {
  const normalized = restaurantName.toLocaleLowerCase('en-US');

  if (normalized.includes('blloku')) {
    return neighborhoodCoordinates.blloku;
  }

  if (normalized.includes('komuna')) {
    return neighborhoodCoordinates['komuna e parisit'];
  }

  if (normalized.includes('don bosko')) {
    return neighborhoodCoordinates['don bosko'];
  }

  if (normalized.includes('pazari')) {
    return neighborhoodCoordinates['pazari i ri'];
  }

  return { latitude: 41.3275, longitude: 19.8187 };
};

const customerCoordinateFromOrder = (order?: Order): Coordinate => {
  if (!order?.deliveryAddress?.mahalle) {
    return { latitude: 41.3275, longitude: 19.8187 };
  }

  const key = order.deliveryAddress.mahalle.toLocaleLowerCase('en-US');
  return neighborhoodCoordinates[key] ?? { latitude: 41.3275, longitude: 19.8187 };
};

export const OrderDetailsScreen = ({ route }: Props) => {
  const { t } = useTranslation();
  const localOrders = useAppStore((state) => state.orders);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const [orders, setOrders] = useState<Order[]>(localOrders);
  const [driverMarker, setDriverMarker] = useState<Coordinate | null>(null);
  const order = orders.find((entry) => entry.id === route.params.orderId);

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
        Alert.alert(t('common.siparisler'), getApiErrorMessage(error, t('errors.network')));
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, localOrders, t]);

  useEffect(() => {
    if (!order) {
      return;
    }

    const unsubscribe = listenDriverLocation(order.backendOrderId ?? order.id, (location: DriverLocation) => {
      setDriverMarker({
        latitude: location.lat,
        longitude: location.lng
      });
    });

    return () => {
      unsubscribe();
    };
  }, [order]);

  const restaurantCoordinate = useMemo(
    () => restaurantCoordinateByName(order?.restaurantNameKey ?? ''),
    [order?.restaurantNameKey]
  );
  const customerCoordinate = useMemo(() => customerCoordinateFromOrder(order), [order]);
  const polylineCoordinates = useMemo(
    () => [restaurantCoordinate, customerCoordinate],
    [customerCoordinate, restaurantCoordinate]
  );
  const initialRegion = useMemo(
    () => ({
      latitude: (restaurantCoordinate.latitude + customerCoordinate.latitude) / 2,
      longitude: (restaurantCoordinate.longitude + customerCoordinate.longitude) / 2,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12
    }),
    [customerCoordinate.latitude, customerCoordinate.longitude, restaurantCoordinate.latitude, restaurantCoordinate.longitude]
  );

  if (!order) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>{t('orders.detayBaslik')}</Text>
        <Text style={styles.subtitle}>{t('common.bos')}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.title}>{t('orders.detayBaslik')}</Text>
        <Text style={styles.subtitle}>{t('orders.detayAltBaslik')}</Text>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.routeLabel}>
          <Text style={styles.routeLabelText}>{t('orders.yol')}</Text>
        </View>
        <OrderMap
          initialRegion={initialRegion}
          restaurantCoordinate={restaurantCoordinate}
          restaurantTitle={t('orders.restoran')}
          customerCoordinate={customerCoordinate}
          customerTitle={t('orders.teslimatNoktasi')}
          driverMarker={driverMarker}
          driverTitle={t('orders.surucuKonumu')}
          polylineCoordinates={polylineCoordinates}
          primaryColor={colors.primary}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {order.restaurantNameKey.includes('.') ? t(order.restaurantNameKey) : order.restaurantNameKey}
        </Text>
        <Text style={styles.meta}>{formatCurrency(order.total)}</Text>
        {order.deliveryAddress ? (
          <Text style={styles.address}>{formatAddressSummary(order.deliveryAddress)}</Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800'
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 21
  },
  mapCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  routeLabel: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 1,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  routeLabelText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800'
  },
  map: {
    width: '100%',
    height: 320
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  meta: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '700'
  },
  address: {
    color: colors.textMuted,
    lineHeight: 20
  }
});
