import React from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { LanguageSwitch } from '../components/LanguageSwitch';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentUserEmail = useAppStore((state) => state.currentUserEmail);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const clearSession = useAppStore((state) => state.clearSession);

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>CABUK</Text>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{currentUserEmail}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Image
            source={{
              uri: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20customer%20profile%20avatar%2C%20friendly%20portrait%2C%20clean%20background%2C%20food%20delivery%20app%20profile%2C%20realistic&image_size=square'
            }}
            style={styles.avatar}
          />
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{currentUserEmail}</Text>
            <Text style={styles.profileHint}>{currentUserId}</Text>
          </View>
        </View>
        <PrimaryButton
          label={t('common.adresYonetimi')}
          variant="outline"
          onPress={() => navigation.navigate('Address')}
        />
        <PrimaryButton
          label={t('common.siparisler')}
          variant="outline"
          onPress={() => navigation.navigate('MainTabs')}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('settings.languageTitle')}</Text>
        <Text style={styles.sectionHint}>{t('settings.languageHint')}</Text>
        <LanguageSwitch />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
        <Text style={styles.supportValue}>{t('settings.supportValue')}</Text>
      </View>

      <PrimaryButton
        label="Log Out"
        variant="secondary"
        onPress={() => {
          Alert.alert('Log Out', 'Sign out of your account?', [
            { text: t('common.iptal'), style: 'cancel' },
            {
              text: 'Log Out',
              style: 'destructive',
              onPress: () => {
                clearSession();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }]
                });
              }
            }
          ]);
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.hero,
    borderRadius: 32,
    padding: 20,
    gap: 8
  },
  eyebrow: {
    color: '#FFD7CE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.surface
  },
  subtitle: {
    color: '#FFE0D8',
    lineHeight: 21
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.heroSoft
  },
  profileMeta: {
    flex: 1,
    gap: 4
  },
  profileName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  profileHint: {
    color: colors.textMuted
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21
  },
  supportValue: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '800'
  }
});
