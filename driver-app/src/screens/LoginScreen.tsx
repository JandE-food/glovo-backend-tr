import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';

import { LanguageSwitch } from '../components/LanguageSwitch';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { connectDriverSocket } from '../services/socket';
import { driverLogin } from '../services/api';
import { useDriverStore } from '../store/useDriverStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const signIn = useDriverStore((state) => state.signIn);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [driverCode, setDriverCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.brand}>{t('common.appName')}</Text>
          <LanguageSwitch />
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="driver@cabuk.al"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('login.phoneLabel')}</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder={t('login.phonePlaceholder')}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('login.codeLabel')}</Text>
            <TextInput
              value={driverCode}
              onChangeText={setDriverCode}
              placeholder={t('login.codePlaceholder')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <PrimaryButton
            label={isSubmitting ? 'Signing In...' : t('login.submit')}
            onPress={() => {
              if (isSubmitting) {
                return;
              }

              if (!email.trim() || !driverCode.trim()) {
                Alert.alert('Sign In', 'Email and driver code are required.');
                return;
              }

              setIsSubmitting(true);
              driverLogin(email.trim(), driverCode)
                .then((response) => {
                  signIn({
                    driverName: response.user?.adSoyad ?? response.user?.name ?? 'Cabuk Driver',
                    driverPhone: phone,
                    driverCode
                  });
                  connectDriverSocket();
                })
                .catch((error) => {
                  if (isAxiosError(error) && error.response?.status === 401) {
                    Alert.alert('Sign In', 'Invalid credentials.');
                    return;
                  }
                  Alert.alert('Sign In', 'Network error');
                })
                .finally(() => setIsSubmitting(false));
            }}
          />
          <PrimaryButton
            label="Create Account"
            variant="outline"
            onPress={() => navigation.navigate('Signup')}
          />

          <View style={styles.demoHint}>
            <Text style={styles.demoHintText}>{t('login.demoHint')}</Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 24,
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 14
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4
  },
  brand: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800'
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  formCard: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  inputGroup: {
    gap: 8
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700'
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 15
  },
  demoHint: {
    alignItems: 'center',
    paddingTop: 4
  },
  demoHintText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  }
});
