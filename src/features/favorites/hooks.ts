import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Product } from '@/types/models';

import { addFavorite, fetchFavoriteProductIds, removeFavorite } from './api';

const favoriteIdsKey = queryKeys.viewer.favoriteProductIds;

export const useFavoriteProductIds = () => {
  const { status } = useAuth();
  return useQuery({
    queryKey: favoriteIdsKey,
    queryFn: fetchFavoriteProductIds,
    enabled: status === 'signedIn',
  });
};

type SetFavoriteInput = { productId: string; favorite: boolean };

const useSetFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, favorite }: SetFavoriteInput) =>
      favorite ? addFavorite(productId) : removeFavorite(productId),
    // ♡は押した瞬間に切り替え、失敗したときだけ元に戻す
    onMutate: async ({ productId, favorite }) => {
      await queryClient.cancelQueries({ queryKey: favoriteIdsKey });
      const previous = queryClient.getQueryData<string[]>(favoriteIdsKey);
      queryClient.setQueryData<string[]>(favoriteIdsKey, (ids = []) => {
        const others = ids.filter((id) => id !== productId);
        return favorite ? [productId, ...others] : others;
      });
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(favoriteIdsKey, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: favoriteIdsKey });
      // 人気順の並びが変わるが、表示中の一覧が指の下で並び替わらないよう再取得は次に開いたときに行う
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all, refetchType: 'none' });
    },
  });
};

export function useProductFavorite(product: Product) {
  const { status, account } = useAuth();
  const { data: favoriteIds } = useFavoriteProductIds();
  const setFavorite = useSetFavorite();

  const isFavorite = favoriteIds?.includes(product.id) ?? false;
  const canFavorite = account?.id !== product.seller.id;

  const toggle = (onError?: (error: unknown) => void) => {
    if (status !== 'signedIn') {
      router.push('/login');
      return;
    }
    setFavorite.mutate({ productId: product.id, favorite: !isFavorite }, { onError });
  };

  return { isFavorite, canFavorite, toggle };
}
