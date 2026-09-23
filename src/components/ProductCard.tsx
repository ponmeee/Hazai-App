import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Product } from '@/types/models';
import { formatPrice } from '@/utils/format';

type ProductCardProps = {
  product: Product;
  style?: StyleProp<ViewStyle>;
};

export function ProductCard({ product, style }: ProductCardProps) {
  return (
    <Link href={{ pathname: '/products/[id]', params: { id: product.id } }} asChild>
      <Pressable accessibilityLabel={`${product.name} ${formatPrice(product.price)}`} style={style}>
        {({ pressed }) => (
          <View style={[styles.container, pressed && styles.pressed]}>
            <Image
              source={{ uri: product.imageUrls[0] }}
              contentFit="cover"
              transition={200}
              style={styles.image}
            />
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  body: {
    gap: spacing.xxs,
  },
  name: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  price: {
    ...typography.price,
    color: colors.textPrimary,
  },
});
