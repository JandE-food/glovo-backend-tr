import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { JobsDashboard } from '../screens/JobsDashboard';
import { LoginScreen } from '../screens/LoginScreen';
import { NavigationScreen } from '../screens/NavigationScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { TripsBreakdown } from '../screens/TripsBreakdown';
import { listenForDriverOrders } from '../services/api';
import { colors } from '../theme/colors';
import { useDriverStore } from '../store/useDriverStore';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14,
          height: 74,
          paddingTop: 10,
          paddingBottom: 10,
          borderTopWidth: 0,
          borderRadius: 24,
          backgroundColor: colors.surface,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 6
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700'
        }
      }}
    >
      <Tabs.Screen name="Orders" component={OrdersScreen} options={{ title: t('tabs.orders') }} />
      <Tabs.Screen name="Map" component={JobsDashboard} options={{ title: t('tabs.map') }} />
      <Tabs.Screen name="Wallet" component={TripsBreakdown} options={{ title: t('tabs.wallet') }} />
      <Tabs.Screen name="Profile" component={SettingsScreen} options={{ title: t('tabs.profile') }} />
    </Tabs.Navigator>
  );
};

export const AppNavigator = () => {
  const { t } = useTranslation();
  const isAuthenticated = useDriverStore((state) => state.isAuthenticated);
  const hydrateLanguage = useDriverStore((state) => state.hydrateLanguage);
  const prependJob = useDriverStore((state) => state.prependJob);

  useEffect(() => {
    void hydrateLanguage();
  }, [hydrateLanguage]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    return listenForDriverOrders(prependJob);
  }, [isAuthenticated, prependJob]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' }
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Navigation"
              component={NavigationScreen}
              options={{ title: t('navigation.title') }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create Account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
