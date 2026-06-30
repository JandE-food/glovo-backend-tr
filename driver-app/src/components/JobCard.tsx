import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from './PrimaryButton';
import { colors } from '../theme/colors';
import type { DriverJob } from '../types/models';
import { formatCurrency } from '../utils/format';

type JobCardProps = {
  job: DriverJob;
  onRoutePress: () => void;
  onAcceptPress: () => void;
};

export const JobCard = ({ job, onRoutePress, onAcceptPress }: JobCardProps) => {
  const { t } = useTranslation();
  const etaMinutes = Math.max(10, Math.round(job.distanceKm * 7));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{t('jobs.readyNow')}</Text>
        </View>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{job.itemCount}</Text>
        </View>
      </View>

      <Text style={styles.payout}>{formatCurrency(job.payout)}</Text>
      <Text style={styles.tripMeta}>
        {etaMinutes} min • {t('jobs.distanceAway', { distance: job.distanceKm })}
      </Text>

      <View style={styles.locationBlock}>
        <Text style={styles.restaurantName}>{job.restaurantName}</Text>
        <Text style={styles.address}>{job.address}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{t('jobs.restaurant')}</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {job.restaurantName}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>{t('jobs.customer')}</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {job.customerName}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionItem}>
          <PrimaryButton label={t('jobs.openRoute')} onPress={onRoutePress} variant="outline" />
        </View>
        <View style={styles.actionItem}>
          <PrimaryButton label={t('jobs.acceptJob')} onPress={onAcceptPress} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 14
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.accentSoft
  },
  badgeLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800'
  },
  itemCountBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6'
  },
  itemCountText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800'
  },
  payout: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800'
  },
  tripMeta: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700'
  },
  locationBlock: {
    gap: 6
  },
  restaurantName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  address: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12
  },
  metaItem: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F8FAFC'
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  metaValue: {
    marginTop: 6,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12
  },
  actionItem: {
    flex: 1
  }
});
