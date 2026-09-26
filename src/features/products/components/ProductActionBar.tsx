import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, layout, radius, shadows, spacing } from '@/theme';

type ProductActionBarProps = {
  isFavorite: boolean;
  isInCart: boolean;
  isUpdatingCart: boolean;
  /** 売り切れのときはカート・購入の代わりに「売り切れ」を表示する */
  isSoldOut: boolean;
  onToggleFavorite: () => void;
  onToggleCart: () => void;
  onPurchase: () => void;
};

export function ProductActionBar({
  isFavorite,
  isInCart,
  isUpdatingCart,
  isSoldOut,
  onToggleFavorite,
  onToggleCart,
  onPurchase,
}: ProductActionBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.favorite}>
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          color={isFavorite ? colors.like : colors.textPrimary}
          accessibilityLabel={isFavorite ? 'お気に入りを解除' : 'お気に入りに追加'}
          onPress={onToggleFavorite}
        />
      </View>
      {isSoldOut ? (
        <PrimaryButton label="売り切れ" onPress={onPurchase} disabled style={styles.button} />
      ) : (
        <>
          <PrimaryButton
            label={isInCart ? 'カートから外す' : 'カートに追加'}
            variant="secondary"
            disabled={isUpdatingCart}
            onPress={onToggleCart}
            style={styles.button}
          />
          <PrimaryButton label="購入する" onPress={onPurchase} style={styles.button} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shadows.floating,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  favorite: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
});
