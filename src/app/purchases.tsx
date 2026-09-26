import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { useOrders } from '@/features/orders/hooks';
import { layout, spacing } from '@/theme';

function PurchaseHistory() {
  const ordersQuery = useOrders();

  return (
    <QueryView query={ordersQuery}>
      {(orders) => (
        <FlatList
          data={orders}
          keyExtractor={(order) => order.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <EmptyState title="まだ購入した商品はありません" description="購入した端材はここに表示されます。" />
          }
        />
      )}
    </QueryView>
  );
}

export default function PurchasesScreen() {
  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="購入履歴" />
      <RequireAuth description="購入履歴を見るにはログインしてください。">{() => <PurchaseHistory />}</RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.lg,
  },
});
