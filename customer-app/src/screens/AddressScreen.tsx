import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import { LocationPickerMap } from '../components/LocationPickerMap';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectField } from '../components/SelectField';
import { TextField } from '../components/TextField';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { AddressPayload, Coordinates } from '../types/models';
import type { RootStackParamList } from '../types/navigation';
import {
  formatAddressSummary,
  getIlceFromMahalle,
  isValidPostalCode,
  mahalleOptions,
} from '../utils/address';

type Props = NativeStackScreenProps<RootStackParamList, 'Address'>;

export const AddressScreen = (_props: Props) => {
  const { t } = useTranslation();
  const addresses = useAppStore((state) => state.addresses);
  const selectedAddressId = useAppStore((state) => state.selectedAddressId);
  const isAddressLoading = useAppStore((state) => state.isAddressLoading);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const fetchAddresses = useAppStore((state) => state.fetchAddresses);
  const createAddress = useAppStore((state) => state.createAddress);
  const updateAddress = useAppStore((state) => state.updateAddress);
  const removeAddress = useAppStore((state) => state.deleteAddress);
  const selectAddress = useAppStore((state) => state.selectAddress);
  const setDefaultAddress = useAppStore((state) => state.setDefaultAddress);
  const [isMahalleOpen, setIsMahalleOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [mahalle, setMahalle] = useState('');
  const [sokak, setSokak] = useState('');
  const [apartmanNo, setApartmanNo] = useState('');
  const [kat, setKat] = useState('');
  const [daire, setDaire] = useState('');
  const [postaKodu, setPostaKodu] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [mahalleError, setMahalleError] = useState('');
  const [postaKoduError, setPostaKoduError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const ilce = useMemo(() => getIlceFromMahalle(mahalle), [mahalle]);
  const il = 'Tirane';

  useEffect(() => {
    void fetchAddresses();
  }, [currentUserId, fetchAddresses]);

  const resetForm = () => {
    setEditingAddressId(null);
    setMahalle('');
    setSokak('');
    setApartmanNo('');
    setKat('');
    setDaire('');
    setPostaKodu('');
    setIsDefault(true);
    setMahalleError('');
    setPostaKoduError('');
    setIsMahalleOpen(false);
    setCoordinates(null);
  };

  const populateForm = (addressId: string) => {
    const currentAddress = addresses.find((address) => address.id === addressId);

    if (!currentAddress) {
      return;
    }

    setEditingAddressId(currentAddress.id);
    setMahalle(currentAddress.mahalle);
    setSokak(currentAddress.sokak);
    setApartmanNo(currentAddress.apartmanNo);
    setKat(currentAddress.kat);
    setDaire(currentAddress.daire);
    setPostaKodu(currentAddress.postaKodu);
    setIsDefault(currentAddress.isDefault);
    setMahalleError('');
    setPostaKoduError('');
    setCoordinates(
      typeof currentAddress.latitude === 'number' && typeof currentAddress.longitude === 'number'
        ? {
            latitude: currentAddress.latitude,
            longitude: currentAddress.longitude
          }
        : null
    );
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(t('address.baslik'), 'Location permission is required to pin your delivery point.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      setCoordinates({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
    } catch {
      Alert.alert(t('address.baslik'), 'Unable to get your current location right now.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    const nextMahalleError = mahalle ? '' : t('address.mahalleZorunlu');
    const nextPostalError = isValidPostalCode(postaKodu) ? '' : t('address.postaKoduHatali');

    setMahalleError(nextMahalleError);
    setPostaKoduError(nextPostalError);

    if (nextMahalleError || nextPostalError) {
      return;
    }

    const payload: AddressPayload = {
      userId: currentUserId,
      mahalle,
      sokak,
      apartmanNo,
      kat,
      daire,
      postaKodu,
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      isDefault,
    };

    try {
      setIsSaving(true);
      if (editingAddressId) {
        await updateAddress(editingAddressId, payload);
      } else {
        await createAddress(payload);
      }
      resetForm();
      Alert.alert(
        t('common.kaydet'),
        editingAddressId ? t('address.guncelleBasarili') : t('address.kayitBasarili')
      );
    } catch {
      Alert.alert(
        t('common.kaydet'),
        editingAddressId ? t('address.guncellemeHatasi') : t('address.kaydetmeHatasi')
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Cabuk</Text>
        <Text style={styles.title}>{t('address.baslik')}</Text>
        <Text style={styles.subtitle}>{t('address.altBaslik')}</Text>
      </View>

      <View style={styles.formCard}>
        <SelectField
          label={t('address.mahalle')}
          value={mahalle}
          placeholder={t('address.mahalleSec')}
          options={mahalleOptions}
          isOpen={isMahalleOpen}
          onToggle={() => setIsMahalleOpen((current) => !current)}
          onSelect={(value) => {
            setMahalle(value);
            setMahalleError('');
            setIsMahalleOpen(false);
          }}
          error={mahalleError}
        />
        <TextField label={t('address.sokak')} value={sokak} onChangeText={setSokak} />
        <TextField
          label={t('address.apartmanNo')}
          value={apartmanNo}
          onChangeText={setApartmanNo}
          keyboardType="numeric"
        />
        <TextField
          label={t('address.kat')}
          value={kat}
          onChangeText={setKat}
          keyboardType="numeric"
        />
        <TextField
          label={t('address.daire')}
          value={daire}
          onChangeText={setDaire}
          keyboardType="numeric"
        />
        <TextField
          label={t('address.postaKodu')}
          value={postaKodu}
          onChangeText={(value) => {
            setPostaKodu(value.replace(/[^\d]/g, '').slice(0, 5));
            setPostaKoduError('');
          }}
          keyboardType="numeric"
        />
        {postaKoduError ? <Text style={styles.errorText}>{postaKoduError}</Text> : null}
        <TextField label={t('address.ilce')} value={ilce} onChangeText={() => undefined} editable={false} />
        <TextField label={t('address.il')} value={il} onChangeText={() => undefined} editable={false} />
        <Pressable onPress={() => setIsDefault((current) => !current)} style={styles.defaultRow}>
          <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
            {isDefault ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </View>
          <Text style={styles.defaultLabel}>{t('address.varsayilan')}</Text>
        </Pressable>
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>Map picker</Text>
              <Text style={styles.locationSubtitle}>
                Use your current location, then tap the map to fine-tune the delivery pin.
              </Text>
            </View>
            <View style={styles.locationButton}>
              <PrimaryButton
                label={isLocating ? 'Locating...' : 'Use current location'}
                onPress={() => {
                  void handleUseCurrentLocation();
                }}
                variant="outline"
              />
            </View>
          </View>
          {coordinates ? (
            <>
              <LocationPickerMap coordinates={coordinates} onChange={setCoordinates} />
              <Text style={styles.locationMeta}>
                {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
              </Text>
            </>
          ) : (
            <Text style={styles.locationPlaceholder}>
              Save a GPS pin for more accurate delivery tracking.
            </Text>
          )}
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.buttonFlex}>
            <PrimaryButton
              label={
                isSaving
                  ? t('common.kaydediliyor')
                  : editingAddressId
                    ? t('address.guncelleButon')
                    : t('address.kaydetButon')
              }
              onPress={() => {
                void handleSave();
              }}
            />
          </View>
          {editingAddressId ? (
            <View style={styles.buttonFlex}>
              <PrimaryButton
                label={t('common.iptal')}
                onPress={resetForm}
                variant="outline"
              />
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('address.kayitliAdresler')}</Text>
      {isAddressLoading ? <Text style={styles.loadingText}>{t('address.listeYukleniyor')}</Text> : null}
      <View style={styles.list}>
        {addresses.map((address) => (
          <Pressable
            key={address.id}
            onPress={() => {
              selectAddress(address.id);
              Alert.alert(t('address.baslik'), t('address.teslimatSecildi'));
            }}
            style={[
              styles.addressCard,
              selectedAddressId === address.id && styles.addressCardSelected,
            ]}
          >
            <View style={styles.addressHeader}>
              <Text style={styles.addressLine}>{address.mahalle}</Text>
              <View style={styles.badgeRow}>
                {address.isDefault ? (
                  <Text style={styles.defaultBadge}>{t('address.varsayilan')}</Text>
                ) : null}
                {selectedAddressId === address.id ? (
                  <Text style={styles.selectedBadge}>{t('cart.varsayilanTeslimat')}</Text>
                ) : null}
              </View>
            </View>
            <Text style={styles.addressText}>{formatAddressSummary(address)}</Text>
            <View style={styles.actionRow}>
              {!address.isDefault ? (
                <Pressable
                  onPress={() => {
                    void setDefaultAddress(address.id).catch(() => {
                      Alert.alert(t('address.baslik'), t('address.guncellemeHatasi'));
                    });
                  }}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>{t('address.varsayilanYap')}</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => populateForm(address.id)} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{t('address.duzenle')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void removeAddress(address.id)
                    .then(() => {
                      Alert.alert(t('address.baslik'), t('alerts.adresSilindi'));
                    })
                    .catch(() => {
                      Alert.alert(t('address.baslik'), t('address.kaydetmeHatasi'));
                    });
                }}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  {t('address.sil')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.hero,
    borderRadius: 32,
    padding: 20,
    gap: 8,
  },
  heroEyebrow: {
    color: '#FFD7CE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.surface,
  },
  subtitle: {
    color: '#FFE0D8',
    lineHeight: 21,
  },
  formCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: colors.surface,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F2EF',
  },
  checkboxActive: {
    backgroundColor: colors.hero,
    borderColor: colors.hero,
  },
  checkboxMark: {
    color: colors.surface,
    fontWeight: '800',
  },
  defaultLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  locationCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8FAFC',
    padding: 14,
    gap: 12,
  },
  locationHeader: {
    gap: 12,
  },
  locationCopy: {
    gap: 4,
  },
  locationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  locationSubtitle: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  locationButton: {
    alignSelf: 'flex-start',
  },
  locationMeta: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  locationPlaceholder: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonFlex: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
  addressCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addressCardSelected: {
    borderColor: colors.hero,
    backgroundColor: '#FFF7F4',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  addressLine: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addressText: {
    color: colors.textMuted,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.heroSoft,
    color: colors.hero,
    fontSize: 12,
    fontWeight: '800',
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F7F2EF',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#FDECEC',
  },
  deleteButtonText: {
    color: colors.danger,
  },
});
