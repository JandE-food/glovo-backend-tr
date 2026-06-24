import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { AppLanguage } from '../types/models';

const languages: AppLanguage[] = ['en', 'sq', 'sr'];

export const LanguageSwitch = () => {
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [isOpen, setIsOpen] = useState(false);

  const options = useMemo(
    () => [
      { code: 'en' as const, label: t('common.english') },
      { code: 'sq' as const, label: t('common.albanian') },
      { code: 'sr' as const, label: t('common.serbian') }
    ],
    [t]
  );
  const selectedLabel = options.find((option) => option.code === language)?.label ?? '';

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen((value) => !value)}
        style={styles.input}
      >
        <Text style={styles.value}>{selectedLabel}</Text>
        <Text style={styles.chevron}>{isOpen ? '▴' : '▾'}</Text>
      </Pressable>
      {isOpen ? (
        <View style={styles.optionsCard}>
          {languages.map((option) => {
            const optionLabel = options.find((entry) => entry.code === option)?.label ?? option;
            const isActive = language === option;

            return (
              <Pressable
                key={option}
                onPress={() => {
                  setIsOpen(false);
                  void setLanguage(option);
                }}
                style={[styles.option, isActive && styles.activeOption]}
              >
                <Text style={[styles.optionText, isActive && styles.activeOptionText]}>
                  {optionLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
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
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 14,
  },
  optionsCard: {
    marginTop: 10,
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
  activeOption: {
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  activeOptionText: {
    color: colors.primaryDark,
  }
});
