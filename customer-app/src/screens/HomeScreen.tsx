import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { CategoryFilterBar } from '../components/CategoryFilterBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { RestaurantCard } from '../components/RestaurantCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { categories, restaurants as fallbackRestaurants } from '../data/mockData';
import { getRestaurants } from '../services/api';
import { colors } from '../theme/colors';
import type { CategoryId, Restaurant } from '../types/models';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import { filterRestaurantsByCategory } from '../utils/restaurants';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [locationLabel, setLocationLabel] = useState(t('home.konumBekleniyor'));
  const [restaurants, setRestaurants] = useState<Restaurant[]>(fallbackRestaurants);
  const quickActions = [
    { key: 'food', category: 'restaurants' as CategoryId },
    { key: 'grocery', category: 'market' as CategoryId },
    { key: 'pharmacy', category: 'pharmacy' as CategoryId },
    { key: 'dessert', category: 'desserts' as CategoryId },
  ];

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          setLocationLabel(t('home.konumYok'));
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        const placemarks = await Location.reverseGeocodeAsync(current.coords);
        const district = placemarks[0]?.district ?? 'Tirane';
        setLocationLabel(district);
      } catch {
        setLocationLabel(t('home.konumYok'));
      }
    };

    void loadLocation();
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const loadRestaurants = async () => {
      try {
        const remoteRestaurants = await getRestaurants(selectedCategory);

        if (!isMounted) {
          return;
        }

        setRestaurants(remoteRestaurants.length > 0 ? remoteRestaurants : fallbackRestaurants);
      } catch {
        if (isMounted) {
          setRestaurants(fallbackRestaurants);
        }
      }
    };

    void loadRestaurants();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const filteredRestaurants = useMemo(
    () => filterRestaurantsByCategory(restaurants, selectedCategory),
    [restaurants, selectedCategory],
  );

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <Text style={styles.deliveryLabel}>{t('home.teslimatNereye')}</Text>
        <Text style={styles.brand}>Cabuk</Text>
        <Pressable onPress={() => navigation.navigate('Address')} style={styles.locationRow}>
          <Text style={styles.locationText}>{locationLabel}</Text>
          <Text style={styles.locationArrow}>›</Text>
        </Pressable>
        <View style={styles.searchBox}>
          <TextInput
            editable={false}
            placeholder={t('home.aramaYerTutucu')}
            placeholderTextColor="#8A8A97"
            style={styles.searchInput}
          />
        </View>
      </View>

      <Text style={styles.title}>{t('home.baslik')}</Text>
      <Text style={styles.subtitle}>{t('home.altBaslik')}</Text>

      <View style={styles.quickGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.key}
            onPress={() => setSelectedCategory(action.category)}
            style={styles.quickCard}
          >
            <Text style={styles.quickIcon}>+</Text>
            <Text style={styles.quickLabel}>{t(`home.hizliAlanlar.${action.key}`)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.promoCard}>
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>{t('home.firsatBaslik')}</Text>
          <Text style={styles.promoText}>{t('home.firsatAltMetin')}</Text>
          <View style={styles.promoButtonWrap}>
            <PrimaryButton
              label={t('home.firsatButon')}
              onPress={() =>
                navigation.navigate('Restaurant', {
                  restaurantId: filteredRestaurants[0]?.id ?? restaurants[0]?.id ?? fallbackRestaurants[0].id
                })
              }
              variant="secondary"
            />
          </View>
        </View>
        <View style={styles.giftBadge}>
          <Text style={styles.giftText}>%</Text>
        </View>
      </View>

      <CategoryFilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <Text style={styles.sectionTitle}>{t('home.onerilenBaslik')}</Text>
      <View style={styles.list}>
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPressMenu={() => navigation.navigate('Restaurant', { restaurantId: restaurant.id })}
          />
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.hero,
    borderRadius: 36,
    padding: 20,
    gap: 10,
  },
  deliveryLabel: {
    color: '#FFD7CE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brand: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '900',
  },
  locationRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationText: {
    color: colors.surface,
    fontSize: 26,
    fontWeight: '800',
  },
  locationArrow: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '700',
  },
  searchBox: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    justifyContent: 'center',
    minHeight: 56,
  },
  searchInput: {
    fontSize: 18,
    color: colors.textMuted,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickCard: {
    width: '47%',
    minHeight: 108,
    borderRadius: 22,
    backgroundColor: '#F7F2EF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  quickIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.hero,
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  promoCard: {
    backgroundColor: colors.darkSurface,
    borderRadius: 28,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    gap: 10,
    paddingRight: 12,
  },
  promoTitle: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  promoText: {
    color: '#E8D5CF',
    fontSize: 14,
    lineHeight: 20,
  },
  promoButtonWrap: {
    width: 150,
  },
  giftBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.darkSurfaceAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftText: {
    color: '#C77D67',
    fontSize: 34,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  list: {
    gap: 16,
  },
});
