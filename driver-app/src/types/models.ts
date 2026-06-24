export type AppLanguage = 'sq' | 'en' | 'sr';

export type DriverJobStatus = 'available' | 'enRoute' | 'atStore' | 'pickedUp' | 'atGate';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type DriverJob = {
  id: string;
  restaurantName: string;
  address: string;
  neighborhood: 'Blloku' | 'KomunaParisit' | 'PazariRi' | 'DonBosko';
  payout: number;
  distanceKm: number;
  status: DriverJobStatus;
  customerName: string;
  itemCount: number;
  restaurantLocation: Coordinates;
  customerLocation: Coordinates;
  instructions: string[];
};

export type TripStat = {
  id: string;
  titleKey: string;
  value: string;
  detailKey: string;
};
