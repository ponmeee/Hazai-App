import { StyleSheet, Text, View } from 'react-native';

import { Notice } from '@/components/Notice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, layout, shadows, spacing, typography } from '@/theme';
import { formatPrice } from '@/utils/format';

type CheckoutFooterProps = {
  itemCount: number;
  totalPrice: number;
  buttonLabel: string;
  onPress: () => void;
  disabled?: boolean;
  /** ボタンの上に出すお知らせ・エラー */
  message?: string | null;
};

/** カートと購入確認の下部に固定する、合計金額と購入ボタン */
export function CheckoutFooter({ itemCount, totalPrice, buttonLabel, onPress, disabled = false, message = null }: CheckoutFooterProps) {
  return (
    <View style={styles.container}>
      {message !== null && <Notice message={message} />}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>合計（{itemCount}点）</Text>
        <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
      </View>
      <PrimaryButton label={buttonLabel} onPress={onPress} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shadows.floating,
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  totalPrice: {
    ...typography.title,
    color: colors.textPrimary,
  },
});
