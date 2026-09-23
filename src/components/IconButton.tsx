import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '@/theme';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

type IconButtonProps = {
  icon: IoniconName;
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  color?: string;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = 24,
  color = colors.textPrimary,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
});
