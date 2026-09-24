import { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import { PrimaryButton } from './PrimaryButton';

type OwnerActionBarProps = {
  note: string;
  deleteLabel: string;
  isDeleting: boolean;
  onDelete: () => void;
  /** 削除の横に並べる操作（編集など） */
  secondaryAction?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
};

/**
 * 自分の出品・作品に対する操作。Web では Alert による確認ダイアログが出ないため、
 * 削除は 2 回押して確定する。
 */
export function OwnerActionBar({ note, deleteLabel, isDeleting, onDelete, secondaryAction, style }: OwnerActionBarProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.note, isConfirming && styles.warning]}>
        {isConfirming ? 'もう一度押すと削除します（元に戻せません）' : note}
      </Text>
      <View style={styles.buttons}>
        {secondaryAction !== undefined && (
          <PrimaryButton
            label={secondaryAction.label}
            variant="secondary"
            onPress={secondaryAction.onPress}
            disabled={isDeleting}
            style={styles.button}
          />
        )}
        <PrimaryButton
          label={isDeleting ? '削除中…' : isConfirming ? '削除を確定' : deleteLabel}
          onPress={() => (isConfirming ? onDelete() : setIsConfirming(true))}
          disabled={isDeleting}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  note: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  warning: {
    color: colors.danger,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
});
