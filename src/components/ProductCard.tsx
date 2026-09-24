import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { colors, radius, spacing, typography } from '@/theme';
import type { Product } from '@/types/models';
import { formatPrice } from '@/utils/format';

type ProductCardProps = {
  product: Product;
  style?: StyleProp<ViewStyle>;
};

export function ProductCard({ product, style }: ProductCardProps) {
  return (
    <View style={style}>
      <Link href={{ pathname: '/products/[id]', params: { id: product.id } }} asChild>
        <Pressable accessibilityLabel={`${product.name} ${formatPrice(product.price)}`}>
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
                <Text style={styles.name} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
              </View>
            </View>
          )}
        </Pressable>
      </Link>
      {/* リンク（<a>）の中にボタンを入れ子にしないよう、価格の行へ重ねて配置する */}
      <View style={styles.favorite}>
        <FavoriteButton product={product} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
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
    gap: spacing.xl,
  },
  name: {
    ...typography.caption,
    // 商品名が1行でも2行でも価格の位置が揃うよう、2行分の高さを確保する
    minHeight: typography.caption.lineHeight * 2,
    color: colors.textPrimary,
  },
  price: {
    ...typography.price,
    paddingRight: spacing.xl,
    color: colors.textPrimary,
  },
  favorite: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    height: typography.price.lineHeight,
    justifyContent: 'center',
  },
});
