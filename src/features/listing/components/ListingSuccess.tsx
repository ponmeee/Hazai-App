import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, layout, spacing, typography } from '@/theme';

type ListingSuccessProps = {
  onViewProduct: () => void;
  onListAnother: () => void;
};

export function ListingSuccess({ onViewProduct, onListAnother }: ListingSuccessProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={56} color={colors.success} />
      <Text style={styles.title}>出品しました</Text>
      <Text style={styles.description}>「かう」や各カテゴリの一覧に表示されます。</Text>
      <View style={styles.actions}>
        <PrimaryButton label="出品した商品を見る" onPress={onViewProduct} />
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
