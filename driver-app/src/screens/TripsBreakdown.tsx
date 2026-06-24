import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../components/ScreenContainer';
import { useDriverStore } from '../store/useDriverStore';
import { colors } from '../theme/colors';

export const TripsBreakdown = () => {
  const { t } = useTranslation();
  const jobs = useDriverStore((state) => state.jobs);
  const completedTrips = jobs.filter((job) => job.status === 'atGate').length;
  const totalEarnings = jobs.reduce((sum, job) => sum + job.payout, 0);

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>WALLET</Text>
        <Text style={styles.title}>{t('trips.title')}</Text>
        <Text style={styles.subtitle}>{t('trips.subtitle')}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('trips.todayIncome')}</Text>
          <Text style={styles.statValue}>ALL {totalEarnings}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('trips.completedTrips')}</Text>
          <Text style={styles.statValue}>{completedTrips}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('trips.onlineTime')}</Text>
          <Text style={styles.statValue}>7h 20m</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{t('trips.acceptanceRate')}</Text>
          <Text style={styles.statValue}>%94</Text>
        </View>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>{t('trips.recentTrips')}</Text>
        {jobs.map((job) => (
          <View key={job.id} style={styles.tripRow}>
            <View>
              <Text style={styles.tripRestaurant}>{job.restaurantName}</Text>
              <Text style={styles.tripMeta}>{job.address}</Text>
            </View>
            <View style={styles.tripRight}>
              <Text style={styles.tripPrice}>ALL {job.payout}</Text>
              <Text style={styles.tripMeta}>{t('trips.ordersLabel', { count: job.itemCount })}</Text>
            </View>
          </View>
        ))}
      </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    width: '48%',
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700'
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800'
  },
  listCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 16
  },
  listTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tripRestaurant: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  tripMeta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13
  },
  tripRight: {
    alignItems: 'flex-end'
  },
  tripPrice: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '800'
  }
});
