import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../components/ScreenContainer';
import { useDriverStore } from '../store/useDriverStore';
import { colors } from '../theme/colors';
import type { DriverJobStatus } from '../types/models';

const progressSequence: Array<{ status: DriverJobStatus; key: string }> = [
  { status: 'enRoute', key: 'progress.enRoute' },
  { status: 'atStore', key: 'progress.arrivedStore' },
  { status: 'pickedUp', key: 'progress.pickedUp' },
  { status: 'atGate', key: 'progress.atGate' }
];

export const PickupQueue = () => {
  const { t } = useTranslation();
  const jobs = useDriverStore((state) => state.jobs);
  const updateJobStatus = useDriverStore((state) => state.updateJobStatus);
  const activeQueue = jobs.filter((job) => job.status !== 'available');

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>LIVE</Text>
        <Text style={styles.title}>{t('pickup.title')}</Text>
        <Text style={styles.subtitle}>{t('pickup.subtitle')}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {activeQueue.length} {t('pickup.queueCount')}
          </Text>
        </View>
      </View>

      {activeQueue.map((job) => (
        <View key={job.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.restaurantName}>{job.restaurantName}</Text>
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>{t('pickup.pickupReady')}</Text>
            </View>
          </View>

          <Text style={styles.address}>{job.address}</Text>
          <Text style={styles.dropoffLabel}>{t('pickup.customerDropoff')}</Text>
          <Text style={styles.dropoffValue}>
            {job.customerName} • {job.itemCount}
          </Text>

          <View style={styles.buttonsRow}>
            {progressSequence.map((item) => {
              const isActive = job.status === item.status;

              return (
                <Pressable
                  key={item.status}
                  onPress={() => {
                    void updateJobStatus(job.id, item.status);
                  }}
                  style={[styles.progressButton, isActive && styles.activeProgressButton]}
                >
                  <Text style={[styles.progressButtonText, isActive && styles.activeProgressButtonText]}>
                    {t(item.key)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
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
  countBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primarySoft
  },
  countBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  restaurantName: {
    flex: 1,
    color: colors.text,
    fontSize: 19,
    fontWeight: '800'
  },
  readyBadge: {
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  readyBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800'
  },
  address: {
    color: colors.textMuted,
    fontSize: 14
  },
  dropoffLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  dropoffValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  progressButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  activeProgressButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  progressButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700'
  },
  activeProgressButtonText: {
    color: colors.surface
  }
});
