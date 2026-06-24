import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import type { OrderStatus } from '../types/models';

type StatusBadgeProps = {
  status: OrderStatus;
};

const orderStatusMeta: Record<
  OrderStatus,
  {
    label: string;
    backgroundColor: string;
    textColor: string;
  }
> = {
  received: {
    label: 'received',
    backgroundColor: '#FFF8E1',
    textColor: '#9A6700'
  },
  preparing: {
    label: 'preparing',
    backgroundColor: '#FFF3E0',
    textColor: '#B45309'
  },
  ready: {
    label: 'ready',
    backgroundColor: '#E8F5E9',
    textColor: '#166534'
  },
  approaching: {
    label: 'approaching',
    backgroundColor: '#E8F5E9',
    textColor: '#166534'
  },
  at_door: {
    label: 'at_door',
    backgroundColor: '#E8F5E9',
    textColor: '#166534'
  },
  delivered: {
    label: 'delivered',
    backgroundColor: '#E8F5E9',
    textColor: '#166534'
  },
  cancelled: {
    label: 'cancelled',
    backgroundColor: '#FDECEC',
    textColor: '#B91C1C'
  }
};

export const getOrderStatusLabel = (status: OrderStatus) => orderStatusMeta[status].label;

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const meta = orderStatusMeta[status];

  return (
    <View style={[styles.badge, { backgroundColor: meta.backgroundColor }]}>
      <Text style={[styles.label, { color: meta.textColor }]}>
        {t(`orders.durum.${status}`, { defaultValue: meta.label })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  label: {
    fontWeight: '700',
    color: colors.text,
  },
});
