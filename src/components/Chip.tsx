import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipDefault,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 34,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDefault: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textOnDark,
  },
});
