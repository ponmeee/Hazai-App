import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { formatPrice } from '@/utils/format';

type PurchaseItemRowProps = {
  name: string;
  price: number;
  imageUrl: string | null;
  /** 出品者名など、商品名の下に出す補足 */
  caption?: string;
  /** 商品ページが残っていればリンクにする */
  productId?: string | null;
};

/** 購入確認・購入履歴で使う商品の行 */
export function PurchaseItemRow({ name, price, imageUrl, caption, productId }: PurchaseItemRowProps) {
  const content = (pressed: boolean) => (
    <View style={[styles.container, pressed && styles.pressed]}>
      {imageUrl === null ? (
        <View style={[styles.image, styles.noImage]}>
          <Ionicons name="image-outline" size={20} color={colors.textTertiary} />
        </View>
      ) : (
        <Image source={imageUrl} contentFit="cover" style={styles.image} />
      )}
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        {caption !== undefined && (
          <Text style={styles.caption} numberOfLines={1}>
            {caption}
          </Text>
        )}
      </View>
      <Text style={styles.price}>{formatPrice(price)}</Text>
    </View>
  );

  if (productId === undefined || productId === null) return content(false);

  return (
    <Link href={{ pathname: '/products/[id]', params: { id: productId } }} asChild>
      <Pressable accessibilityLabel={`${name}の商品ページ`}>{({ pressed }) => content(pressed)}</Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  price: {
    ...typography.price,
    color: colors.textPrimary,
  },
});
