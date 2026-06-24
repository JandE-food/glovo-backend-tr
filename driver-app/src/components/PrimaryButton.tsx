import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
};

export const PrimaryButton = ({
  label,
  onPress,
  variant = 'primary'
}: PrimaryButtonProps) => {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondaryButton,
        isOutline && styles.outlineButton,
        pressed && styles.pressed
      ]}
    >
      <Text
        style={[
          styles.label,
          isSecondary && styles.secondaryLabel,
          isOutline && styles.outlineLabel
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4
  },
  secondaryButton: {
    backgroundColor: colors.dark
  },
  outlineButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0
  },
  pressed: {
    opacity: 0.86
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryLabel: {
    color: colors.surface
  },
  outlineLabel: {
    color: colors.textMuted
  }
});
