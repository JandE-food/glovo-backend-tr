import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useDriverStore } from '../store/useDriverStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';
import { formatCurrency } from '../utils/format';

export const OrdersScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const jobs = useDriverStore((state) => state.jobs);
  const setCurrentJob = useDriverStore((state) => state.setCurrentJob);
  const updateJobStatus = useDriverStore((state) => state.updateJobStatus);
  const availableJobs = jobs.filter((job) => job.status === 'available');

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>ORDERS</Text>
        <Text style={styles.title}>{t('jobs.title')}</Text>
        <Text style={styles.subtitle}>Review new deliveries, accept them, and open the live route.</Text>
      </View>

      <View style={styles.list}>
        {availableJobs.map((job) => (
          <View key={job.id} style={styles.orderCard}>
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{job.status}</Text>
              </View>
              <Text style={styles.price}>{formatCurrency(job.payout)}</Text>
            </View>
            <Text style={styles.restaurant}>{job.restaurantName}</Text>
            <Text style={styles.meta}>{job.address}</Text>
            <Text style={styles.meta}>
              {job.customerName} • {job.itemCount} items • {job.distanceKm}km
            </Text>
            <View style={styles.actions}>
              <View style={styles.actionItem}>
                <PrimaryButton
                  label={t('jobs.openRoute')}
                  variant="outline"
                  onPress={() => {
                    setCurrentJob(job.id);
                    navigation.navigate('Navigation', { jobId: job.id });
                  }}
                />
              </View>
              <View style={styles.actionItem}>
                <PrimaryButton
                  label={t('jobs.acceptJob')}
                  onPress={() => {
                    setCurrentJob(job.id);
                    void updateJobStatus(job.id, 'enRoute');
                    navigation.navigate('Navigation', { jobId: job.id });
                  }}
                />
              </View>
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
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
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
  list: {
    gap: 14
  },
  orderCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badge: {
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize'
  },
  price: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  restaurant: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  actionItem: {
    flex: 1
  }
});
