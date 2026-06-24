import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import type { CategoryId } from '../types/models';

type CategoryFilterBarProps = {
  categories: CategoryId[];
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
};

export const CategoryFilterBar = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterBarProps) => {
  const { t } = useTranslation();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {categories.map((category) => {
        const active = category === selectedCategory;

        return (
          <Pressable
            key={category}
            onPress={() => onSelectCategory(category)}
            style={[styles.chip, active && styles.activeChip]}
          >
            <Text style={[styles.chipText, active && styles.activeChipText]}>
              {t(`categories.${category}`)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 6,
  },
  chip: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#F7F2EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: colors.hero,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  activeChipText: {
    color: colors.surface,
  },
});
