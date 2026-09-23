import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export type ProductSpec = {
  label: string;
  value: string;
};

type ProductSpecListProps = {
  specs: ProductSpec[];
};

export function ProductSpecList({ specs }: ProductSpecListProps) {
  return (
    <View style={styles.container}>
      {specs.map((spec, index) => (
        <View key={spec.label} style={[styles.row, index > 0 && styles.rowDivider]}>
          <Text style={styles.label}>{spec.label}</Text>
          <Text style={styles.value}>{spec.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  label: {
    ...typography.bodySmall,
    width: 72,
    color: colors.textSecondary,
  },
  value: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textPrimary,
  },
});
