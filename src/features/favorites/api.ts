import { apiRequest } from '@/api/client';

const favoritePath = (productId: string): string => `/products/${encodeURIComponent(productId)}/favorite`;

export const fetchFavoriteProductIds = (): Promise<string[]> => apiRequest<string[]>('/me/favorite-product-ids');

export const addFavorite = (productId: string): Promise<void> =>
  apiRequest<void>(favoritePath(productId), { method: 'POST' });

export const removeFavorite = (productId: string): Promise<void> =>
  apiRequest<void>(favoritePath(productId), { method: 'DELETE' });
