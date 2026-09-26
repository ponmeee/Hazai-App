import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontWeights, radius, spacing, typography } from '@/theme';
import { formatTag } from '@/utils/hashtags';

type HashtagChipProps = {
  tag: string;
  /** 押すとそのタグで検索するなど */
  onPress?: () => void;
  /** 入力欄で使うときの削除ボタン */
  onRemove?: () => void;
};

export function HashtagChip({ tag, onPress, onRemove }: HashtagChipProps) {
  const label = <Text style={styles.label}>{formatTag(tag)}</Text>;

  return (
    <View style={styles.chip}>
      {onPress === undefined ? (
        label
      ) : (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${formatTag(tag)}で検索`}
          hitSlop={spacing.xs}
          style={({ pressed }) => pressed && styles.pressed}
        >
          {label}
        </Pressable>
      )}
      {onRemove !== undefined && (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`${formatTag(tag)}を外す`}
          hitSlop={spacing.sm}
        >
          <Ionicons name="close" size={14} color={colors.accent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...typography.caption,
    ...fontWeights.semiBold,
    color: colors.accent,
  },
});
