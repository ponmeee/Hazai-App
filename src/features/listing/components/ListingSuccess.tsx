import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, layout, spacing, typography } from '@/theme';

type ListingSuccessProps = {
  onViewProducts: () => void;
  onListAnother: () => void;
};

export function ListingSuccess({ onViewProducts, onListAnother }: ListingSuccessProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={56} color={colors.success} />
      <Text style={styles.title}>出品を受け付けました</Text>
      <Text style={styles.description}>
        デモ版のため、入力内容は保存されていません。{'\n'}実際の出品はアカウント機能の公開後に利用できます。
      </Text>
      <View style={styles.actions}>
        <PrimaryButton label="商品一覧へ" onPress={onViewProducts} />
        <PrimaryButton label="続けて出品する" variant="secondary" onPress={onListAnother} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
