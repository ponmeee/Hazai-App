import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { FormField } from './FormField';

type FormInputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
};

export function FormInput({ label, required, error, hint, multiline, ...inputProps }: FormInputProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <TextInput
        {...inputProps}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, multiline && styles.multiline, error !== undefined && styles.invalid]}
      />
    </FormField>
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  invalid: {
    borderColor: colors.danger,
  },
});
