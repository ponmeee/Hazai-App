import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontWeights, radius, spacing, typography } from '@/theme';

type SoftChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  shape?: 'pill' | 'square';
};

/** 枠線のない淡いグレーのチップ。選択中は濃い色で塗る */
export function SoftChip({ label, selected, onPress, shape = 'pill' }: SoftChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        shape === 'square' && styles.square,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 60,
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  square: {
    borderRadius: radius.xs,
  },
  selected: {
    backgroundColor: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.caption,
    ...fontWeights.bold,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.textOnDark,
  },
});
