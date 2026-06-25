import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { TextField } from '../components/TextField';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';
import { getApiErrorMessage, signup } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export const SignupScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(name, email, password, phone);
      Alert.alert(t('common.kayitOl'), t('auth.kayitBasarili'));
      navigation.replace('Login');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        Alert.alert(t('common.kayitOl'), 'You already have an account.', [
          {
            text: t('common.girisYap'),
            onPress: () => navigation.replace('Login')
          }
        ]);
        return;
      }

      if (error instanceof Error && error.message === 'You already have an account.') {
        Alert.alert(t('common.kayitOl'), error.message, [
          {
            text: t('common.girisYap'),
            onPress: () => navigation.replace('Login')
          }
        ]);
        return;
      }

      Alert.alert(t('common.kayitOl'), getApiErrorMessage(error, t('errors.network')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>{t('common.kayitOl')}</Text>
        <Text style={styles.subtitle}>{t('auth.kayitAltBaslik')}</Text>
      </View>

      <View style={styles.card}>
        <TextField
          label={t('common.adSoyad')}
          value={name}
          onChangeText={setName}
          placeholder={t('auth.adSoyadYerTutucu')}
        />
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
        <TextField
          label={t('common.telefon')}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('auth.telefonYerTutucu')}
          keyboardType="phone-pad"
        />
        <PrimaryButton
          label={isSubmitting ? t('common.kaydediliyor') : t('common.kayitOl')}
          onPress={() => {
            void handleSignup();
          }}
        />
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>{t('auth.hesabinVar')}</Text>
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
  link: {
    textAlign: 'center',
    color: colors.accent,
    fontWeight: '700',
  },
});
