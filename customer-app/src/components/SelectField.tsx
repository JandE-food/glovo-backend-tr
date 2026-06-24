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
  error?: string;
};

export const SelectField = ({
  label,
  value,
  placeholder,
  options,
  isOpen,
  onToggle,
  onSelect,
  error,
}: SelectFieldProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>{label}</Text>
    <Pressable onPress={onToggle} style={[styles.input, error && styles.inputError]}>
      <Text style={[styles.value, !value && styles.placeholder]}>
        {value || placeholder}
      </Text>
      <Text style={styles.chevron}>{isOpen ? '▴' : '▾'}</Text>
    </Pressable>
    {isOpen ? (
      <View style={styles.optionsCard}>
        {options.map((option) => (
          <Pressable key={option} onPress={() => onSelect(option)} style={styles.option}>
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
      </View>
    ) : null}
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: colors.danger,
  },
  value: {
    color: colors.text,
    fontSize: 15,
  },
  placeholder: {
    color: colors.textMuted,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 14,
  },
  optionsCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  option: {
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E7E3',
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
});
