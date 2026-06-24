import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: readonly string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

export const SelectField = ({
  label,
  value,
  placeholder,
  options,
  isOpen,
  onToggle,
  onSelect
}: SelectFieldProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <Pressable onPress={onToggle} style={styles.input}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
      <Text style={styles.chevron}>{isOpen ? '▴' : '▾'}</Text>
    </Pressable>
    {isOpen ? (
      <View style={styles.optionsCard}>
        {options.map((option, index) => (
          <Pressable key={option} onPress={() => onSelect(option)} style={styles.option}>
            <Text style={styles.optionText}>{option}</Text>
            {index < options.length - 1 ? <View style={styles.divider} /> : null}
          </Pressable>
        ))}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  value: {
    color: colors.text,
    fontSize: 15
  },
  placeholder: {
    color: colors.textMuted
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 14
  },
  optionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden'
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600'
  },
  divider: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    height: 1,
    backgroundColor: colors.border
  }
});
