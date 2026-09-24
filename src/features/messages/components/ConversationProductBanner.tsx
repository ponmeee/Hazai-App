import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/theme';
import type { Conversation } from '@/types/models';
import { formatPrice } from '@/utils/format';

type ConversationProductBannerProps = {
  product: NonNullable<Conversation['product']>;
};

/** どの商品についての会話かを常に示す */
export function ConversationProductBanner({ product }: ConversationProductBannerProps) {
  return (
    <Link href={{ pathname: '/products/[id]', params: { id: product.id } }} asChild>
      <Pressable accessibilityLabel={`${product.name}の商品ページ`}>
        {({ pressed }) => (
          <View style={[styles.container, pressed && styles.pressed]}>
            <Image source={product.imageUrl} contentFit="cover" style={styles.image} />
            <View style={styles.text}>
              <Text style={styles.name} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  image: {
    width: 44,
    height: 44,
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
  price: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
