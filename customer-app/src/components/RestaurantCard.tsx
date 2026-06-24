import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import type { Restaurant } from '../types/models';
import { PrimaryButton } from './PrimaryButton';

type RestaurantCardProps = {
  restaurant: Restaurant;
  onPressMenu: () => void;
};

export const RestaurantCard = ({ restaurant, onPressMenu }: RestaurantCardProps) => {
  const { t } = useTranslation();
  const title = restaurant.nameKey.includes('.') ? t(restaurant.nameKey) : restaurant.nameKey;
  const subtitle = restaurant.descriptionKey.includes('.')
    ? t(restaurant.descriptionKey)
    : restaurant.descriptionKey;

  return (
    <View style={styles.card}>
      <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>★ {restaurant.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
        </View>
        <PrimaryButton label={t('common.menuyeGit')} onPress={onPressMenu} variant="secondary" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 190,
  },
  content: {
    padding: 18,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.heroSoft,
  },
  badgeText: {
    color: colors.hero,
    fontWeight: '700',
  },
  deliveryTime: {
    color: colors.text,
    fontWeight: '600',
  },
});
