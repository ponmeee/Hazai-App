import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/features/auth/AuthProvider';

import { fetchOrders, fetchProductsByIds, purchaseProducts } from './api';

export const useProductsByIds = (ids: string[]) =>
  useQuery({
    queryKey: queryKeys.products.byIds(ids),
    queryFn: () => fetchProductsByIds(ids),
    enabled: ids.length > 0,
  });

export const useOrders = () => {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.viewer.orders,
    queryFn: fetchOrders,
    enabled: status === 'signedIn',
  });
};

export const usePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseProducts,
    onSuccess: () =>
      Promise.all([
        // 購入した商品は売り切れになり、一覧・カートから外れる
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.viewer.cart }),
        queryClient.invalidateQueries({ queryKey: queryKeys.viewer.orders }),
      ]),
  });
};
