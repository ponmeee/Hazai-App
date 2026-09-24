import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { FormField } from './FormField';

type FormInputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  required?: boolean;
  labelVariant?: 'default' | 'sub';
  error?: string;
  hint?: string;
};

export function FormInput({ label, required, labelVariant, error, hint, multiline, ...inputProps }: FormInputProps) {
  return (
    <FormField label={label} required={required} labelVariant={labelVariant} error={error} hint={hint}>
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
    ...typography.input,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  invalid: {
    borderColor: colors.danger,
  },
});
