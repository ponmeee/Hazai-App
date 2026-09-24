import { FlatList, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { CartItemRow } from '@/features/cart/components/CartItemRow';
import { useCartItems, useRemoveFromCart } from '@/features/cart/hooks';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { colors, layout, shadows, spacing, typography } from '@/theme';
import { formatPrice } from '@/utils/format';

function CartContent() {
  const cartQuery = useCartItems();
  const removeFromCart = useRemoveFromCart();
  const [notice, showNotice] = useTransientMessage();

  return (
    <QueryView query={cartQuery}>
      {(items) => {
        const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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
              ListEmptyComponent={
                <EmptyState title="カートは空です" description="気になる端材を「カートに追加」してみましょう。" />
              }
            />
            {items.length > 0 && (
              <View style={styles.footer}>
                {notice !== null && <Notice message={notice} />}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>合計（{items.length}点）</Text>
                  <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
                </View>
                <PrimaryButton label="購入手続きへ" onPress={() => showNotice('決済機能は準備中です')} />
              </View>
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
  footer: {
    ...shadows.floating,
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  totalPrice: {
    ...typography.title,
    color: colors.textPrimary,
  },
});
