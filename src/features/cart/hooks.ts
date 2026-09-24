import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/features/auth/AuthProvider';

import { addToCart, fetchCartItems, removeFromCart } from './api';

export const useCartItems = () => {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.viewer.cart,
    queryFn: fetchCartItems,
    enabled: status === 'signedIn',
  });
};

const useSetInCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, inCart }: { productId: string; inCart: boolean }) =>
      inCart ? addToCart(productId) : removeFromCart(productId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.viewer.cart }),
  });
};

/** 商品がカートに入っているかと、その切り替え。未ログインならログイン画面へ */
export function useProductCart(productId: string) {
  const { status } = useAuth();
  const { data: items } = useCartItems();
  const setInCart = useSetInCart();

  const isInCart = items?.some((item) => item.product.id === productId) ?? false;

  const toggle = (callbacks?: { onSuccess?: (inCart: boolean) => void; onError?: (error: unknown) => void }) => {
    if (status !== 'signedIn') {
      router.push('/login');
      return;
    }
    const inCart = !isInCart;
    setInCart.mutate(
      { productId, inCart },
      { onSuccess: () => callbacks?.onSuccess?.(inCart), onError: callbacks?.onError },
    );
  };

  return { isInCart, isUpdating: setInCart.isPending, toggle };
}

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromCart,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.viewer.cart }),
  });
};
