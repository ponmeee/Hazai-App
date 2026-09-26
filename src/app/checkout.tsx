import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/SuccessState';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { CheckoutFooter } from '@/features/orders/components/CheckoutFooter';
import { PurchaseItemRow } from '@/features/orders/components/PurchaseItemRow';
import { useProductsByIds, usePurchase } from '@/features/orders/hooks';
import { colors, layout, radius, spacing, typography } from '@/theme';
import type { Product } from '@/types/models';

/** URL の ids（カンマ区切り）から購入する商品 ID を取り出す */
const parseIds = (value: string | undefined): string[] =>
  [...new Set((value ?? '').split(',').map((id) => id.trim()))].filter((id) => id !== '');

type CheckoutContentProps = {
  products: Product[];
  purchase: ReturnType<typeof usePurchase>;
};

function CheckoutContent({ products, purchase }: CheckoutContentProps) {
  const purchasable = products.filter((product) => product.status === 'active');
  const unavailable = products.filter((product) => product.status !== 'active');
  const total = purchasable.reduce((sum, product) => sum + product.price, 0);

  if (purchasable.length === 0) {
    return <EmptyState title="購入できる商品がありません" description="売り切れ、または購入できない商品です。" />;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>購入する商品</Text>
          <View style={styles.items}>
            {purchasable.map((product) => (
              <PurchaseItemRow
                key={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrls[0] ?? null}
                caption={product.seller.name}
                productId={product.id}
              />
            ))}
          </View>
        </View>

        {unavailable.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>購入できない商品</Text>
            <Text style={styles.note}>売り切れになったため、今回の購入には含まれません。</Text>
            <View style={[styles.items, styles.unavailable]}>
              {unavailable.map((product) => (
                <PurchaseItemRow
                  key={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrls[0] ?? null}
                  caption="売り切れ"
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>お支払い</Text>
          <View style={styles.paymentNote}>
            <Text style={styles.note}>
              現在、アプリ内での決済には対応していません。購入を確定しても代金の支払いは発生しないため、支払い・受け取り方法は出品者とメッセージで相談してください。
            </Text>
          </View>
        </View>
      </ScrollView>

      <CheckoutFooter
        itemCount={purchasable.length}
        totalPrice={total}
        buttonLabel={purchase.isPending ? '購入中…' : '購入を確定する'}
        onPress={() => purchase.mutate(purchasable.map((product) => product.id))}
        disabled={purchase.isPending}
        message={purchase.isError ? getErrorMessage(purchase.error) : null}
      />
    </>
  );
}

function CheckoutProducts({ ids }: { ids: string[] }) {
  const productsQuery = useProductsByIds(ids);
  // 購入後に商品一覧を再取得するため、完了表示は商品の読み込み状態に左右されない位置で出す
  const purchase = usePurchase();

  if (purchase.isSuccess) {
    return (
      <SuccessState
        title="購入が完了しました"
        description="受け取り方法などは、商品ページの「出品者へ問い合わせる」から出品者と相談してください。"
        primaryAction={{ label: '購入履歴を見る', onPress: () => router.replace('/purchases') }}
        secondaryAction={{ label: '買い物を続ける', onPress: () => router.replace('/buy') }}
      />
    );
  }
  if (ids.length === 0) return <EmptyState title="購入する商品が選ばれていません" />;
  return (
    <QueryView query={productsQuery}>
      {(products) => <CheckoutContent products={products} purchase={purchase} />}
    </QueryView>
  );
}

export default function CheckoutScreen() {
  const { ids } = useLocalSearchParams<{ ids?: string }>();

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="購入手続き" />
      <RequireAuth description="購入するにはログインしてください。">
        {() => <CheckoutProducts ids={parseIds(ids)} />}
      </RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  items: {
    gap: spacing.md,
  },
  unavailable: {
    opacity: 0.5,
  },
  paymentNote: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
