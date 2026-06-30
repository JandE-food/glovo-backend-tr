import type { DriverJob, TripStat } from '../types/models';

export const radiusOptions = ['1km', '3km', '5km', '10km'] as const;
export const neighborhoodOptions = ['Blloku', 'KomunaParisit', 'PazariRi', 'DonBosko'] as const;

export const mockJobs: DriverJob[] = [
  {
    id: 'job-1',
    restaurantName: 'Blloku Grill House',
    address: 'Rruga Ibrahim Rugova, Blloku',
    neighborhood: 'Blloku',
    payout: 800,
    distanceKm: 2.3,
    status: 'available',
    customerName: 'Elira Hoxha',
    itemCount: 3,
    restaurantLocation: { latitude: 41.3188, longitude: 19.8164 },
    customerLocation: { latitude: 41.3214, longitude: 19.8197 },
    instructions: ['Kthehu majtas te kryqezimi', 'Vazhdo drejt per 200 m', 'Ndalo para hyrjes ne te djathte']
  },
  {
    id: 'job-2',
    restaurantName: 'Komuna Pasta Lab',
    address: 'Rruga Medar Shtylla, Komuna e Parisit',
    neighborhood: 'KomunaParisit',
    payout: 760,
    distanceKm: 3.1,
    status: 'enRoute',
    customerName: 'Arber Kola',
    itemCount: 2,
    restaurantLocation: { latitude: 41.3099, longitude: 19.7978 },
    customerLocation: { latitude: 41.3076, longitude: 19.8034 },
    instructions: ['Vazhdo drejt bulevardit kryesor', 'Ec edhe 200 m', 'Kthehu majtas te pika e dorezimit']
  },
  {
    id: 'job-3',
    restaurantName: 'Pazari Fresh Kitchen',
    address: 'Rruga Hoxha Tahsim, Pazari i Ri',
    neighborhood: 'PazariRi',
    payout: 820,
    distanceKm: 4.8,
    status: 'atStore',
    customerName: 'Megi Dervishi',
    itemCount: 4,
    restaurantLocation: { latitude: 41.3317, longitude: 19.8245 },
    customerLocation: { latitude: 41.3342, longitude: 19.8301 },
    instructions: ['Vazhdo drejt sheshit', 'Kthehu djathtas te semafori', 'Prit te porta e nderteses']
  },
  {
    id: 'job-4',
    restaurantName: 'Don Bosko Burger Spot',
    address: 'Rruga Don Bosko, Tirane',
    neighborhood: 'DonBosko',
    payout: 790,
    distanceKm: 1.7,
    status: 'pickedUp',
    customerName: 'Sindi Gjoni',
    itemCount: 1,
    restaurantLocation: { latitude: 41.3458, longitude: 19.7921 },
    customerLocation: { latitude: 41.3415, longitude: 19.7986 },
    instructions: ['Kthehu djathtas sapo te dalesh', 'Vazhdo drejt per 250 m', 'Njofto ne hyrje te kompleksit']
  }
];

export const dailyTripStats: TripStat[] = [
  { id: 'income', titleKey: 'trips.todayIncome', value: 'GBP 4,860', detailKey: 'common.tirana' },
  { id: 'completed', titleKey: 'trips.completedTrips', value: '12', detailKey: 'trips.ordersLabel' },
  { id: 'online', titleKey: 'trips.onlineTime', value: '7h 20m', detailKey: 'jobs.socketStatus' },
  { id: 'acceptance', titleKey: 'trips.acceptanceRate', value: '%94', detailKey: 'pickup.pickupReady' }
];
