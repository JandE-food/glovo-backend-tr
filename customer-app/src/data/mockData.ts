import type { CategoryId, MenuItem, Restaurant } from '../types/models';

export const categories: CategoryId[] = [
  'all',
  'restaurants',
  'breakfast',
  'pide',
  'desserts',
  'market',
  'pharmacy'
];

export const restaurants: Restaurant[] = [
  {
    id: 'r1',
    nameKey: 'restaurants.eminonuLokmasi.name',
    descriptionKey: 'restaurants.eminonuLokmasi.description',
    rating: 4.8,
    deliveryTime: '15-30 min',
    category: 'desserts',
    imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=traditional%20Albanian%20dessert%20restaurant%20in%20Tirana%2C%20trilece%20and%20bakery%20display%2C%20cozy%20evening%20lighting%2C%20realistic%20food%20photography&image_size=landscape_16_9'
  },
  {
    id: 'r2',
    nameKey: 'restaurants.besiktasKahvalti.name',
    descriptionKey: 'restaurants.besiktasKahvalti.description',
    rating: 4.7,
    deliveryTime: '20-35 min',
    category: 'breakfast',
    imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rich%20Albanian%20breakfast%20table%20in%20Tirana%20cafe%2C%20byrek%2C%20cheese%2C%20olives%2C%20tea%2C%20bright%20natural%20light%2C%20realistic%20food%20photography&image_size=landscape_16_9'
  },
  {
    id: 'r3',
    nameKey: 'restaurants.uskudarPide.name',
    descriptionKey: 'restaurants.uskudarPide.description',
    rating: 4.9,
    deliveryTime: '15-25 min',
    category: 'pide',
    imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Albanian%20restaurant%20counter%20with%20freshly%20baked%20tave%20kosi%20and%20savory%20pastries%2C%20Tirana%20food%20style%2C%20realistic%20food%20photo&image_size=landscape_16_9'
  },
  {
    id: 'r4',
    nameKey: 'restaurants.kadikoyMarket.name',
    descriptionKey: 'restaurants.kadikoyMarket.description',
    rating: 4.6,
    deliveryTime: '10-20 min',
    category: 'market',
    imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20local%20grocery%20delivery%20store%20in%20Tirana%2C%20fresh%20produce%20shelves%2C%20clean%20bright%20interior%2C%20realistic%20retail%20photo&image_size=landscape_16_9'
  },
  {
    id: 'r5',
    nameKey: 'restaurants.beyogluEczane.name',
    descriptionKey: 'restaurants.beyogluEczane.description',
    rating: 4.9,
    deliveryTime: '10-15 min',
    category: 'pharmacy',
    imageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=clean%20Albanian%20pharmacy%20interior%20in%20Tirana%2C%20green%20cross%20signage%2C%20organized%20shelves%2C%20realistic%20retail%20photo&image_size=landscape_16_9'
  }
];

export const menuItems: MenuItem[] = [
  {
    id: 'm1',
    restaurantId: 'r3',
    nameKey: 'menu.simit.name',
    descriptionKey: 'menu.simit.description',
    price: 25
  },
  {
    id: 'm2',
    restaurantId: 'r3',
    nameKey: 'menu.pide.name',
    descriptionKey: 'menu.pide.description',
    price: 45
  },
  {
    id: 'm3',
    restaurantId: 'r1',
    nameKey: 'menu.kunefe.name',
    descriptionKey: 'menu.kunefe.description',
    price: 60
  },
  {
    id: 'm4',
    restaurantId: 'r2',
    nameKey: 'menu.cigKofte.name',
    descriptionKey: 'menu.cigKofte.description',
    price: 55
  }
];

export const getRestaurantById = (restaurantId: string) =>
  restaurants.find((restaurant) => restaurant.id === restaurantId);

export const getMenuByRestaurantId = (restaurantId: string) => {
  const baseItems = menuItems.filter((item) => item.restaurantId === restaurantId);
  return baseItems.length > 0 ? baseItems : menuItems;
};
