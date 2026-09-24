import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeights, spacing, typography } from '@/theme';

type FormFieldProps = {
  label: string;
  required?: boolean;
  /** sub: 見出しの下にまとめた項目の小さなラベル */
  labelVariant?: 'default' | 'sub';
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({
  label,
  required = false,
  labelVariant = 'default',
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={labelVariant === 'sub' ? styles.subLabel : styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
      {error !== undefined ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        hint !== undefined && <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    ...fontWeights.bold,
    color: colors.textPrimary,
  },
  subLabel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  required: {
    color: colors.danger,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
