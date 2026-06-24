import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline } from '../components/MapWrapper';

import { FilterChip } from '../components/FilterChip';
import { JobCard } from '../components/JobCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectField } from '../components/SelectField';
import { neighborhoodOptions, radiusOptions } from '../data/mockData';
import { useDriverStore } from '../store/useDriverStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';

const getRadiusValue = (radius: string) => Number(radius.replace('km', ''));

export const JobsDashboard = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const jobs = useDriverStore((state) => state.jobs);
  const refreshJobs = useDriverStore((state) => state.refreshJobs);
  const setCurrentJob = useDriverStore((state) => state.setCurrentJob);
  const updateJobStatus = useDriverStore((state) => state.updateJobStatus);
  const [radius, setRadius] = useState<(typeof radiusOptions)[number]>('5km');
  const [neighborhood, setNeighborhood] = useState('');
  const [isNeighborhoodOpen, setNeighborhoodOpen] = useState(false);

  useEffect(() => {
    void refreshJobs();
  }, [refreshJobs]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          job.distanceKm <= getRadiusValue(radius) &&
          (!neighborhood || job.neighborhood === neighborhood)
      ),
    [jobs, neighborhood, radius]
  );
  const featuredJob = filteredJobs[0];
  const mapCoordinates = useMemo(() => {
    if (!featuredJob) {
      return [];
    }

    return [featuredJob.restaurantLocation, featuredJob.customerLocation];
  }, [featuredJob]);
  const initialRegion = useMemo(() => {
    if (!featuredJob) {
      return {
        latitude: 41.3275,
        longitude: 19.8187,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08
      };
    }

    return {
      latitude: (featuredJob.restaurantLocation.latitude + featuredJob.customerLocation.latitude) / 2,
      longitude: (featuredJob.restaurantLocation.longitude + featuredJob.customerLocation.longitude) / 2,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08
    };
  }, [featuredJob]);

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>{t('common.tirana')}</Text>
          <Text style={styles.title}>{t('jobs.title')}</Text>
          <Text style={styles.subtitle}>{t('jobs.subtitle')}</Text>
        </View>
        <View style={styles.feedBadge}>
          <Text style={styles.feedBadgeText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.mapStage}>
        <MapView style={styles.map} initialRegion={initialRegion} scrollEnabled={false}>
          {featuredJob ? (
            <>
              <Marker coordinate={featuredJob.restaurantLocation} title={featuredJob.restaurantName} />
              <Marker coordinate={featuredJob.customerLocation} title={featuredJob.customerName} />
              <Polyline coordinates={mapCoordinates} strokeColor={colors.primary} strokeWidth={4} />
            </>
          ) : null}
        </MapView>
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayLabel}>{t('jobs.socketStatus')}</Text>
          {featuredJob ? (
            <>
              <Text style={styles.mapOverlayValue}>ALL {featuredJob.payout}</Text>
              <Text style={styles.mapOverlayMeta}>
                {Math.max(10, Math.round(featuredJob.distanceKm * 7))} min • {t('jobs.distanceAway', { distance: featuredJob.distanceKm })}
              </Text>
              <Text style={styles.mapOverlayRestaurant}>{featuredJob.restaurantName}</Text>
              <Text style={styles.mapOverlayAddress}>{featuredJob.address}</Text>
            </>
          ) : (
            <Text style={styles.mapOverlayAddress}>{t('jobs.subtitle')}</Text>
          )}
        </View>
      </View>

      <View style={styles.filterCard}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('jobs.radius')}</Text>
          <View style={styles.chipsRow}>
            {radiusOptions.map((option) => (
              <FilterChip
                key={option}
                label={t(`filters.${option}`)}
                isActive={option === radius}
                onPress={() => setRadius(option)}
              />
            ))}
          </View>
        </View>

        <SelectField
          label={t('jobs.neighborhood')}
          value={neighborhood ? t(`neighborhoods.${neighborhood}`) : ''}
          placeholder={t('jobs.allNeighborhoods')}
          options={neighborhoodOptions.map((option) => t(`neighborhoods.${option}`))}
          isOpen={isNeighborhoodOpen}
          onToggle={() => setNeighborhoodOpen((current) => !current)}
          onSelect={(value) => {
            const selectedValue =
              neighborhoodOptions.find((option) => t(`neighborhoods.${option}`) === value) ?? '';
            setNeighborhood(selectedValue);
            setNeighborhoodOpen(false);
          }}
        />
      </View>

      <View style={styles.cards}>
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onRoutePress={() => {
              setCurrentJob(job.id);
              navigation.navigate('Navigation', { jobId: job.id });
            }}
            onAcceptPress={() => {
              setCurrentJob(job.id);
              void updateJobStatus(job.id, 'enRoute');
            }}
          />
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2
  },
  title: {
    marginTop: 8,
    color: colors.text,
    fontSize: 32,
    fontWeight: '800'
  },
  subtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: '92%'
  },
  feedBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.dark
  },
  feedBadgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700'
  },
  mapStage: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    minHeight: 320,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 18
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4
  },
  map: {
    height: 320,
    width: '100%'
  },
  mapOverlay: {
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
  mapOverlayLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  mapOverlayValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800'
  },
  mapOverlayMeta: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700'
  },
  mapOverlayRestaurant: {
    marginTop: 4,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  mapOverlayAddress: {
    color: colors.textMuted,
    fontSize: 14
  },
  filterCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 18
  },
  section: {
    gap: 12
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800'
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  cards: {
    gap: 14
  }
});
