import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

export const FilterChip = ({ label, isActive, onPress }: FilterChipProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.chip, isActive && styles.activeChip, pressed && styles.pressed]}
  >
    <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  activeChip: {
    backgroundColor: colors.surface,
    borderColor: colors.surface,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  pressed: {
    opacity: 0.84
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  activeLabel: {
    color: colors.primary
  }
});
