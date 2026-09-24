import Ionicons from '@expo/vector-icons/Ionicons';
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
            {product.imageUrls[0] === undefined ? (
              <View style={[styles.image, styles.noImage]}>
                <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
              </View>
            ) : (
              <Image source={product.imageUrls[0]} contentFit="cover" transition={200} style={styles.image} />
            )}
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
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
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
