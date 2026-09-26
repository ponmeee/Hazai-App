import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { colors, fontWeights, layout, radius, spacing, typography } from '@/theme';
import type { Product } from '@/types/models';
import { formatPrice } from '@/utils/format';

type CartItemRowProps = {
  product: Product;
  isRemoving: boolean;
  onRemove: () => void;
};

export function CartItemRow({ product, isRemoving, onRemove }: CartItemRowProps) {
  const isSoldOut = product.status !== 'active';

  return (
    <View style={styles.container}>
      <Link href={{ pathname: '/products/[id]', params: { id: product.id } }} asChild>
        <Pressable accessibilityLabel={`${product.name}の商品ページ`} style={styles.link}>
          {({ pressed }) => (
            <View style={[styles.linkContent, pressed && styles.pressed, isSoldOut && styles.soldOut]}>
              <Image source={product.imageUrls[0] ?? null} contentFit="cover" style={styles.image} />
              <View style={styles.text}>
                <Text style={styles.name} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.seller} numberOfLines={1}>
                  {product.seller.name}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatPrice(product.price)}</Text>
                  {isSoldOut && <Text style={styles.soldOutLabel}>売り切れ</Text>}
                </View>
              </View>
            </View>
          )}
        </Pressable>
      </Link>
      <IconButton
        icon="trash-outline"
        accessibilityLabel={`${product.name}をカートから外す`}
        color={isRemoving ? colors.textTertiary : colors.textSecondary}
        onPress={isRemoving ? undefined : onRemove}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
  },
  link: {
    flex: 1,
  },
  linkContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  soldOut: {
    opacity: 0.5,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    ...typography.label,
    color: colors.textPrimary,
  },
  seller: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  price: {
    ...typography.price,
    color: colors.textPrimary,
  },
  soldOutLabel: {
    ...typography.caption,
    ...fontWeights.bold,
    color: colors.danger,
  },
});
