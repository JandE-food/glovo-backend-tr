import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import type { MenuItem } from '../types/models';
import { formatCurrency } from '../utils/format';
import { PrimaryButton } from './PrimaryButton';

type MenuItemCardProps = {
  item: MenuItem;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export const MenuItemCard = ({ item, quantity, onIncrement, onDecrement }: MenuItemCardProps) => {
  const { t } = useTranslation();
  const title = item.nameKey.includes('.') ? t(item.nameKey) : item.nameKey;
  const description = item.descriptionKey.includes('.')
    ? t(item.descriptionKey)
    : item.descriptionKey;

  return (
    <View style={styles.card}>
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : null}
      <View style={styles.info}>
        <Text style={styles.title}>{`${title} (${formatCurrency(item.price)})`}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.qtyRow}>
          <Pressable
            onPress={onDecrement}
            disabled={quantity <= 0}
            style={({ pressed }) => [
              styles.qtyButton,
              quantity <= 0 && styles.qtyButtonDisabled,
              pressed && styles.qtyButtonPressed
            ]}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </Pressable>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <Pressable
            onPress={onIncrement}
            style={({ pressed }) => [styles.qtyButton, pressed && styles.qtyButtonPressed]}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </Pressable>
        </View>
        <PrimaryButton label={t('common.sepeteEkle')} onPress={onIncrement} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 168,
  },
  info: {
    paddingHorizontal: 16,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  qtyButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.heroSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyButtonDisabled: {
    opacity: 0.55
  },
  qtyButtonPressed: {
    opacity: 0.85
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  qtyValue: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: colors.text
  }
});
