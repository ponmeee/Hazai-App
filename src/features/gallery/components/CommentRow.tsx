import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/UserAvatar';
import { colors, fontWeights, layout, spacing, typography } from '@/theme';
import type { GalleryComment } from '@/types/models';
import { formatRelativeTime } from '@/utils/format';

type CommentRowProps = {
  comment: GalleryComment;
  /** コメントした本人、または作品の投稿者なら削除できる（最終的な判定は RLS） */
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: () => void;
};

export function CommentRow({ comment, canDelete, isDeleting, onDelete }: CommentRowProps) {
  // Web では確認ダイアログが出ないため、「削除」→「削除する」の 2 回押しで確定する
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <View style={styles.container}>
      <UserAvatar uri={comment.author.avatarUrl} size={32} name={comment.author.name} />
      <View style={styles.body}>
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {comment.author.name}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.body}</Text>
      </View>
      {canDelete && (
        <Pressable
          onPress={() => (isConfirming ? onDelete() : setIsConfirming(true))}
          disabled={isDeleting}
          accessibilityRole="button"
          accessibilityLabel={isConfirming ? 'コメントの削除を確定' : 'コメントを削除'}
          hitSlop={spacing.sm}
        >
          <Text style={[styles.delete, isConfirming && styles.deleteConfirm]}>
            {isDeleting ? '削除中…' : isConfirming ? '削除する' : '削除'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  name: {
    ...typography.label,
    flexShrink: 1,
    color: colors.textPrimary,
  },
  time: {
    ...typography.captionSmall,
    color: colors.textTertiary,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  delete: {
    ...typography.captionSmall,
    color: colors.textTertiary,
  },
  deleteConfirm: {
    ...fontWeights.bold,
    color: colors.danger,
  },
});
