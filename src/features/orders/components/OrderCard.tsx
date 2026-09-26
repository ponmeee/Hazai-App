import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Order } from '@/types/models';
import { formatDate, formatPrice } from '@/utils/format';

import { PurchaseItemRow } from './PurchaseItemRow';

/** 購入履歴の 1 回分の購入 */
export function OrderCard({ order }: { order: Order }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        <Text style={styles.count}>{order.items.length}点</Text>
      </View>
      <View style={styles.items}>
        {order.items.map((item) => (
          <PurchaseItemRow
            key={item.id}
            name={item.name}
            price={item.price}
            imageUrl={item.imageUrl}
            productId={item.productId}
            caption={item.productId === null ? '出品は削除されています' : undefined}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>合計</Text>
        <Text style={styles.totalPrice}>{formatPrice(order.totalPrice)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  items: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  totalPrice: {
    ...typography.price,
    color: colors.textPrimary,
  },
});
