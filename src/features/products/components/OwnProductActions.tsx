import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, layout, shadows, spacing, typography } from '@/theme';

type OwnProductActionsProps = {
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * 自分の出品に対する操作。Web では Alert による確認ダイアログが出ないため、
 * 取り消しは 2 回押して確定する。
 */
export function OwnProductActions({ isDeleting, onEdit, onDelete }: OwnProductActionsProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.note, isConfirmingDelete && styles.warning]}>
        {isConfirmingDelete ? 'もう一度押すと出品を取り消します（元に戻せません）' : 'あなたが出品した商品です'}
      </Text>
      <View style={styles.buttons}>
        <PrimaryButton label="編集する" variant="secondary" onPress={onEdit} disabled={isDeleting} style={styles.button} />
        <PrimaryButton
          label={isDeleting ? '取り消し中…' : isConfirmingDelete ? '取り消しを確定' : '出品を取り消す'}
          onPress={() => (isConfirmingDelete ? onDelete() : setIsConfirmingDelete(true))}
          disabled={isDeleting}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shadows.floating,
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
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
