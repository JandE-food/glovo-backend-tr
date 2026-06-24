import type { CategoryId, Restaurant } from '../types/models';

export const filterRestaurantsByCategory = (
  restaurants: Restaurant[],
  category: CategoryId
) => {
  if (category === 'all') {
    return restaurants;
  }

  if (category === 'restaurants') {
    return restaurants.filter((restaurant) =>
      ['breakfast', 'pide', 'desserts'].includes(restaurant.category)
    );
  }

  return restaurants.filter((restaurant) => restaurant.category === category);
};
