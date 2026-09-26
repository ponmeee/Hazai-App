import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { CartItemRow } from '@/features/cart/components/CartItemRow';
import { useCartItems, useRemoveFromCart } from '@/features/cart/hooks';
import { CheckoutFooter } from '@/features/orders/components/CheckoutFooter';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { colors, layout, spacing, typography } from '@/theme';

function CartContent() {
  const cartQuery = useCartItems();
  const removeFromCart = useRemoveFromCart();
  const [notice, showNotice] = useTransientMessage();

  return (
    <QueryView query={cartQuery}>
      {(items) => {
        // 他の人に先に購入された商品はカートに残るが、購入の対象からは外す
        const purchasable = items.filter((item) => item.product.status === 'active');
        const soldOutCount = items.length - purchasable.length;
        const total = purchasable.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        const goToCheckout = () =>
          router.push({
            pathname: '/checkout',
            params: { ids: purchasable.map((item) => item.product.id).join(',') },
          });

        return (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CartItemRow
                  product={item.product}
                  isRemoving={removeFromCart.isPending && removeFromCart.variables === item.product.id}
                  onRemove={() =>
                    removeFromCart.mutate(item.product.id, {
                      onError: (error) => showNotice(getErrorMessage(error)),
                    })
                  }
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListHeaderComponent={
                soldOutCount > 0 ? (
                  <Text style={styles.soldOutNote}>
                    売り切れの商品が{soldOutCount}点あります。売り切れの商品は購入できません。
                  </Text>
                ) : null
              }
              ListEmptyComponent={
                <EmptyState title="カートは空です" description="気になる端材を「カートに追加」してみましょう。" />
              }
            />
            {items.length > 0 && (
              <CheckoutFooter
                itemCount={purchasable.length}
                totalPrice={total}
                buttonLabel="まとめて購入手続きへ"
                onPress={goToCheckout}
                disabled={purchasable.length === 0}
                message={notice}
              />
            )}
          </>
        );
      }}
    </QueryView>
  );
}

export default function CartScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="カート" />
      <RequireAuth description="カートを見るにはログインしてください。">{() => <CartContent />}</RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: layout.screenPaddingX,
    backgroundColor: colors.divider,
  },
  soldOutNote: {
    ...typography.caption,
    color: colors.danger,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.md,
  },
});
