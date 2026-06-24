export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  Restaurant: { restaurantId: string };
  Address: undefined;
  OrderDetails: { orderId: string };
  Payment: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  SettingsTab: undefined;
};
