import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { MenuItemCard } from '../components/MenuItemCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { getMenuByRestaurantId, getRestaurantById } from '../data/mockData';
import { getApiErrorMessage, getRestaurant, isNetworkUnavailableError } from '../services/api';
import { calculateCartTotal, useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { MenuItem, Restaurant } from '../types/models';
import type { RootStackParamList } from '../types/navigation';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Restaurant'>;

export const RestaurantScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>(() =>
    getRestaurantById(restaurantId)
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getMenuByRestaurantId(restaurantId));
  const addToCart = useAppStore((state) => state.addToCart);
  const clearCart = useAppStore((state) => state.clearCart);
  const setCartItemQuantity = useAppStore((state) => state.setCartItemQuantity);
  const cartItems = useAppStore((state) => state.cartItems);

  const openCart = () => {
    navigation.navigate('MainTabs');
  };

  const showCartPopup = () => {
    const currentTotal = calculateCartTotal(useAppStore.getState().cartItems);
    Alert.alert(
      t('common.sepet'),
      `${t('common.toplam')}: ${formatCurrency(currentTotal)}`,
      [
        {
          text: t('common.sepet'),
          onPress: openCart
        },
        {
          text: t('common.devamEt'),
          style: 'cancel'
        }
      ]
    );
  };

  useEffect(() => {
    let isMounted = true;

    const loadRestaurant = async () => {
      try {
        const response = await getRestaurant(restaurantId);

        if (!isMounted) {
          return;
        }

        setRestaurant(response.restaurant);
        setMenuItems(
          response.menu.length > 0 ? response.menu : getMenuByRestaurantId(restaurantId)
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setRestaurant(getRestaurantById(restaurantId));
        setMenuItems(getMenuByRestaurantId(restaurantId));

        if (!isNetworkUnavailableError(error)) {
          Alert.alert(t('menu.baslik'), getApiErrorMessage(error, t('errors.network')));
        }
      }
    };

    void loadRestaurant();

    return () => {
      isMounted = false;
    };
  }, [restaurantId, t]);

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        {restaurant?.imageUrl ? <Image source={{ uri: restaurant.imageUrl }} style={styles.heroImage} /> : null}
        <Text style={styles.title}>
          {restaurant
            ? restaurant.nameKey.includes('.')
              ? t(restaurant.nameKey)
              : restaurant.nameKey
            : t('menu.baslik')}
        </Text>
        <Text style={styles.subtitle}>
          {restaurant
            ? restaurant.descriptionKey.includes('.')
              ? t(restaurant.descriptionKey)
              : restaurant.descriptionKey
            : t('home.altBaslik')}
        </Text>
      </View>

      <View>
        {menuItems.map((item) => (
          (() => {
            const quantity = cartItems.find((entry) => entry.id === item.id)?.quantity ?? 0;

            return (
          <MenuItemCard
            key={item.id}
            item={item}
            quantity={quantity}
            onIncrement={() => {
              const result = addToCart(item, restaurantId);
              if (!result.ok && result.reason === 'different_restaurant') {
                Alert.alert(
                  t('common.sepet'),
                  'Your cart already has items from another restaurant. Start a new order for this restaurant?',
                  [
                    { text: t('common.iptal'), style: 'cancel' },
                    {
                      text: t('common.devamEt'),
                      onPress: () => {
                        clearCart();
                        addToCart(item, restaurantId);
                        showCartPopup();
                      }
                    }
                  ]
                );
                return;
              }

              showCartPopup();
            }}
            onDecrement={() => {
              setCartItemQuantity(item.id, restaurantId, quantity - 1);
            }}
          />
            );
          })()
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: {
    gap: 8,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
