import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys, type ProductListFilter } from '@/api/queryKeys';

import { deleteProduct, fetchPopularProducts, fetchProduct, fetchProducts } from './api';

export const useProducts = (filter: ProductListFilter) =>
  useQuery({
    queryKey: queryKeys.products.list(filter),
    queryFn: () => fetchProducts(filter),
    // 検索語やカテゴリを切り替えた瞬間に一覧が消えないよう、直前の結果を表示し続ける
    placeholderData: keepPreviousData,
  });

export const usePopularProducts = (limit: number) =>
  useQuery({
    queryKey: queryKeys.products.popular(limit),
    queryFn: () => fetchPopularProducts(limit),
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetchProduct(id),
  });

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};
