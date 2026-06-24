import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { isAxiosError } from 'axios';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { driverSignup } from '../services/api';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export const SignupScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [driverName, setDriverName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [driverCode, setDriverCode] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const persistImage = async (uri: string) => {
    const fileExtensionMatch = uri.match(/\.(\w+)(\?.*)?$/);
    const extension = fileExtensionMatch?.[1] ? `.${fileExtensionMatch[1]}` : '.jpg';
    const destination = `${FileSystem.documentDirectory ?? ''}cabuk_driver_avatar_${Date.now()}${extension}`;
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Signup', 'Photo library permission is required to upload a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (result.canceled) {
      return;
    }

    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      return;
    }

    const persistedUri = await persistImage(uri);
    setProfileImageUrl(persistedUri);
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Signup', 'Camera permission is required to take a profile photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (result.canceled) {
      return;
    }

    const uri = result.assets?.[0]?.uri;
    if (!uri) {
      return;
    }

    const persistedUri = await persistImage(uri);
    setProfileImageUrl(persistedUri);
  };

  const handleSignup = async () => {
    if (isSubmitting) {
      return;
    }

    if (!driverName.trim() || !email.trim() || !driverCode.trim() || !profileImageUrl.trim()) {
      Alert.alert('Signup', 'Name, email, driver code, and profile photo are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await driverSignup({
        name: driverName,
        email,
        password: driverCode,
        phone
      });

      Alert.alert('Signup', 'Your account has been created. Please sign in.');
      navigation.navigate('Login');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        Alert.alert('Signup', 'You already have an account.', [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Login')
          }
        ]);
        return;
      }

      Alert.alert('Signup', 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.brand}>{t('common.appName')}</Text>
        <Text style={styles.title}>Create Driver Account</Text>
        <Text style={styles.subtitle}>A profile picture is required before the driver account can go live.</Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.photoRow}>
          <Image
            source={{
              uri:
                profileImageUrl ||
                'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20courier%20driver%20profile%20portrait%2C%20clean%20background%2C%20mobile%20app%20avatar%2C%20realistic&image_size=square'
            }}
            style={styles.avatar}
          />
          <View style={styles.photoActions}>
            <PrimaryButton label="Upload Photo" variant="outline" onPress={() => void pickFromLibrary()} />
            <PrimaryButton label="Use Camera" variant="outline" onPress={() => void pickFromCamera()} />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput value={driverName} onChangeText={setDriverName} style={styles.input} />
        </View>
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
        <PrimaryButton label={isSubmitting ? 'Creating...' : 'Create Account'} onPress={() => void handleSignup()} />
        <PrimaryButton
          label="Back to Sign In"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 24,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4
  },
  brand: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800'
  },
  title: {
    color: colors.text,
    fontSize: 30,
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
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primarySoft
  },
  photoActions: {
    flex: 1,
    gap: 10
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
  }
});
