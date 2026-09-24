import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { colors, spacing } from '@/theme';
import type { Product } from '@/types/models';

import { useProductFavorite } from '../hooks';

type FavoriteButtonProps = {
  product: Product;
  size?: number;
};

/** 商品カードに置く小さな♡。自分の出品には表示しない */
export function FavoriteButton({ product, size = 16 }: FavoriteButtonProps) {
  const { isFavorite, canFavorite, toggle } = useProductFavorite(product);

  if (!canFavorite) return null;

  return (
    <Pressable
      onPress={() => toggle()}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? `${product.name}をお気に入りから解除` : `${product.name}をお気に入りに追加`}
      accessibilityState={{ selected: isFavorite }}
      hitSlop={spacing.md}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? colors.like : colors.textPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.5,
  },
});
