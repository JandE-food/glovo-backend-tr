import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, Polyline } from '../components/MapWrapper';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '../components/ScreenContainer';
import { startDriverLocationStreaming } from '../services/api';
import { useDriverStore } from '../store/useDriverStore';
import { colors } from '../theme/colors';
import type { Coordinates } from '../types/models';
import type { RootStackParamList } from '../types/navigation';
import { formatCurrency } from '../utils/format';

type NavigationScreenProps = NativeStackScreenProps<RootStackParamList, 'Navigation'>;

const fallbackDriverLocation: Coordinates = {
  latitude: 41.3275,
  longitude: 19.8187
};

export const NavigationScreen = ({ route }: NavigationScreenProps) => {
  const { t } = useTranslation();
  const jobs = useDriverStore((state) => state.jobs);
  const currentJobId = useDriverStore((state) => state.currentJobId);
  const [driverLocation, setDriverLocation] = useState<Coordinates>(fallbackDriverLocation);
  const job = jobs.find((item) => item.id === (route.params?.jobId ?? currentJobId)) ?? jobs[0];

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    const loadLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({});
      setDriverLocation({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 3000
        },
        (position) => {
          setDriverLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }
      );
    };

    void loadLocation();

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!job) {
      return;
    }

    let stopStreaming: (() => void) | undefined;

    const startStreaming = async () => {
      stopStreaming = await startDriverLocationStreaming(job.id);
    };

    void startStreaming();

    return () => {
      stopStreaming?.();
    };
  }, [job]);

  const routeCoordinates = useMemo(() => {
    if (!job) {
      return [driverLocation];
    }

    return [driverLocation, job.restaurantLocation, job.customerLocation];
  }, [driverLocation, job]);

  const mapRegion = useMemo(() => {
    if (!job) {
      return {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      };
    }

    return {
      latitude: (driverLocation.latitude + job.customerLocation.latitude) / 2,
      longitude: (driverLocation.longitude + job.customerLocation.longitude) / 2,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    };
  }, [driverLocation.latitude, driverLocation.longitude, job]);

  if (!job) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>{t('navigation.title')}</Text>
          <Text style={styles.subtitle}>{t('jobs.subtitle')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.mapCard}>
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          region={mapRegion}
          showsUserLocation
          showsCompass
        >
          <Marker coordinate={driverLocation} title={t('navigation.driverLocation')} />
          <Marker coordinate={job.restaurantLocation} title={t('navigation.restaurantStop')} />
          <Marker coordinate={job.customerLocation} title={t('navigation.customerStop')} />
          <Polyline coordinates={routeCoordinates} strokeColor={colors.primary} strokeWidth={4} />
        </MapView>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{t('navigation.title')}</Text>
          <Text style={styles.title}>{formatCurrency(job.payout)}</Text>
          <Text style={styles.subtitle}>{t('navigation.subtitle')}</Text>
        </View>
      </View>

      <View style={styles.timelineCard}>
        <View style={styles.stopCard}>
          <Text style={styles.stopLabel}>{t('navigation.pickupEta')}</Text>
          <Text style={styles.stopValue}>{job.restaurantName}</Text>
        </View>
        <View style={styles.stopCard}>
          <Text style={styles.stopLabel}>{t('navigation.dropoffEta')}</Text>
          <Text style={styles.stopValue}>{job.customerName}</Text>
        </View>
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>{t('navigation.routeHint')}</Text>
        {job.instructions.map((step) => (
          <View key={step} style={styles.instructionRow}>
            <View style={styles.dot} />
            <Text style={styles.instructionText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 4,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
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
  mapCard: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    minHeight: 360
  },
  map: {
    width: '100%',
    height: 360
  },
  timelineCard: {
    flexDirection: 'row',
    gap: 12
  },
  stopCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16
  },
  stopLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  stopValue: {
    marginTop: 6,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800'
  },
  instructionsCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14
  },
  instructionsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800'
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary
  },
  instructionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  }
});
