import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { Message } from '@/types/models';
import { formatDateTime } from '@/utils/format';

type MessageBubbleProps = {
  message: Message;
  isMine: boolean;
};

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <View style={[styles.container, isMine ? styles.alignEnd : styles.alignStart]}>
      <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
        <Text style={[styles.body, isMine && styles.bodyMine]}>{message.body}</Text>
      </View>
      <Text style={styles.time}>{formatDateTime(message.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    gap: spacing.xxs,
  },
  alignStart: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  mine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: radius.sm / 2,
  },
  theirs: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.sm / 2,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  bodyMine: {
    color: colors.textOnDark,
  },
  time: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textTertiary,
  },
});
