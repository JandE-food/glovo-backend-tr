import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { TextField } from '../components/TextField';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';
import { getApiErrorMessage, login } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const setSession = useAppStore((state) => state.setSession);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login(email, password);
      setSession({
        userId: response.user?.id ?? response.user?._id ?? response.user?.userId,
        email: response.user?.email ?? email
      });
      Alert.alert(t('common.girisYap'), t('auth.girisBasarili'));
      navigation.replace('MainTabs');
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        Alert.alert(t('common.girisYap'), t('errors.invalidCredentials'));
        return;
      }

      Alert.alert(
        t('common.girisYap'),
        getApiErrorMessage(error, t('errors.network'), {
          invalidCredentialsMessage: t('errors.invalidCredentials')
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <View style={styles.languageRow}>
          <Pressable
            onPress={() => {
              void setLanguage('en');
            }}
            style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
          >
            <Text style={[styles.languageLabel, language === 'en' && styles.languageLabelActive]}>
              {t('common.english')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void setLanguage('sr');
            }}
            style={[styles.languageButton, language === 'sr' && styles.languageButtonActive]}
          >
            <Text style={[styles.languageLabel, language === 'sr' && styles.languageLabelActive]}>
              {t('common.serbian')}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.title}>{t('common.girisYap')}</Text>
        <Text style={styles.subtitle}>{t('auth.girisAltBaslik')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>{t('auth.girisBaslik')}</Text>
        <TextField
          label={t('common.email')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.epostaYerTutucu')}
          keyboardType="email-address"
        />
        <TextField
          label={t('common.sifre')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.sifreYerTutucu')}
          secureTextEntry
        />
        <PrimaryButton
          label={isSubmitting ? t('common.kaydediliyor') : t('common.girisYap')}
          onPress={() => {
            void handleLogin();
          }}
        />
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>{t('auth.hesabinYok')}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    marginTop: 16,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  languageButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF7F4',
  },
  languageLabel: {
    fontWeight: '700',
    color: colors.textMuted,
    fontSize: 13,
  },
  languageLabelActive: {
    color: colors.primaryDark,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  link: {
    textAlign: 'center',
    color: colors.accent,
    fontWeight: '700',
  },
});
