import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { useOrders, useProductsByIds } from '@/features/orders/hooks';
import { PurchaseItemRow } from '@/features/orders/components/PurchaseItemRow';
import { colors, spacing, typography } from '@/theme';
import type { OrderItem } from '@/types/models';
import { formatTag } from '@/utils/hashtags';

export type PurchasedMaterial = {
  productId: string;
  name: string;
  imageUrl: string | null;
  tags: string[];
};

type PurchasedMaterialSheetProps = {
  visible: boolean;
  /** すでに追加した出品は選べないようにする */
  selectedProductIds: string[];
  onSelect: (material: PurchasedMaterial) => void;
  onClose: () => void;
};

/** 購入履歴から、出品が残っている商品を新しい順に重複なく取り出す */
const collectPurchasedItems = (items: OrderItem[]): (OrderItem & { productId: string })[] => {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    if (item.productId === null || seen.has(item.productId)) return [];
    seen.add(item.productId);
    return [{ ...item, productId: item.productId }];
  });
};

export function PurchasedMaterialSheet({ visible, selectedProductIds, onSelect, onClose }: PurchasedMaterialSheetProps) {
  const ordersQuery = useOrders();
  const purchased = collectPurchasedItems((ordersQuery.data ?? []).flatMap((order) => order.items));
  // ハッシュタグは購入時点ではなく出品の今の内容を表示する（投稿時も DB が出品から写す）
  const productsQuery = useProductsByIds(purchased.map((item) => item.productId));
  const tagsByProductId = new Map((productsQuery.data ?? []).map((product) => [product.id, product.tags]));
  const selectable = purchased.filter((item) => !selectedProductIds.includes(item.productId));

  const renderBody = () => {
    if (ordersQuery.isPending) return <LoadingState />;
    if (selectable.length === 0) {
      return (
        <EmptyState
          title={purchased.length === 0 ? '購入した端材はまだありません' : '追加できる端材はありません'}
          description="「写真を追加」から、使った素材を登録することもできます。"
        />
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.list}>
        {selectable.map((item) => {
          const tags = tagsByProductId.get(item.productId) ?? [];
          return (
            <Pressable
              key={item.productId}
              onPress={() => onSelect({ productId: item.productId, name: item.name, imageUrl: item.imageUrl, tags })}
              accessibilityRole="button"
              style={({ pressed }) => pressed && styles.pressed}
            >
              <PurchaseItemRow
                name={item.name}
                price={item.price}
                imageUrl={item.imageUrl}
                caption={tags.length === 0 ? undefined : tags.map(formatTag).join(' ')}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="購入履歴から追加">
      <Text style={styles.note}>選んだ端材のハッシュタグは、出品時のものが引き継がれます。</Text>
      {renderBody()}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
});
