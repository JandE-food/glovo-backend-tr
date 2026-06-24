import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { LanguageSwitch } from '../components/LanguageSwitch';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useDriverStore } from '../store/useDriverStore';
import { colors } from '../theme/colors';

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const signOut = useDriverStore((state) => state.signOut);
  const driverName = useDriverStore((state) => state.driverName);
  const driverPhone = useDriverStore((state) => state.driverPhone);
  const profileImageUrl = useDriverStore((state) => state.profileImageUrl);
  const updateProfile = useDriverStore((state) => state.updateProfile);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [editableName, setEditableName] = useState(driverName);
  const [editablePhone, setEditablePhone] = useState(driverPhone);
  const [editableImageUrl, setEditableImageUrl] = useState(profileImageUrl);

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
      Alert.alert('Profile Photo', 'Photo library permission is required to upload a profile photo.');
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
    setEditableImageUrl(persistedUri);
    updateProfile({ profileImageUrl: persistedUri });
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Profile Photo', 'Camera permission is required to take a profile photo.');
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
    setEditableImageUrl(persistedUri);
    updateProfile({ profileImageUrl: persistedUri });
  };

  const openPhotoPicker = () => {
    Alert.alert('Profile Photo', 'Choose how you want to set your profile photo.', [
      { text: 'Camera', onPress: () => void pickFromCamera() },
      { text: 'Upload', onPress: () => void pickFromLibrary() },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>PROFILE</Text>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: editableImageUrl }} style={styles.avatar} />
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{editableName}</Text>
            <Text style={styles.profileDetail}>{editablePhone || '+355 69 000 0000'}</Text>
          </View>
        </View>
        <PrimaryButton label="Edit Photo" onPress={openPhotoPicker} variant="outline" />
        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>Driver Name</Text>
          <TextInput value={editableName} onChangeText={setEditableName} style={styles.input} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>Phone</Text>
          <TextInput
            value={editablePhone}
            onChangeText={setEditablePhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>
        <PrimaryButton
          label="Update Profile"
          onPress={() =>
            updateProfile({
              driverName: editableName,
              driverPhone: editablePhone,
              profileImageUrl: editableImageUrl
            })
          }
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('settings.languageTitle')}</Text>
        <Text style={styles.sectionHint}>{t('settings.languageHint')}</Text>
        <LanguageSwitch />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>{t('settings.notifications')}</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>{t('settings.location')}</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{t('settings.support')}</Text>
        <Text style={styles.supportValue}>{t('settings.supportValue')}</Text>
      </View>

      <PrimaryButton label={t('common.logout')} onPress={signOut} variant="secondary" />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 22,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 14
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
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
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16
  },
  rowContent: {
    flex: 1
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft
  },
  profileMeta: {
    flex: 1,
    gap: 4
  },
  profileName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800'
  },
  profileDetail: {
    color: colors.textMuted,
    fontSize: 14
  },
  inputGroup: {
    gap: 8
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 15
  },
  rowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  supportValue: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '800'
  }
});
