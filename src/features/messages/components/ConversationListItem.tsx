import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/UserAvatar';
import { colors, layout, spacing, typography } from '@/theme';
import type { Conversation } from '@/types/models';
import { formatDateTime } from '@/utils/format';

type ConversationListItemProps = {
  conversation: Conversation;
  viewerId: string;
};

export function ConversationListItem({ conversation, viewerId }: ConversationListItemProps) {
  const { otherUser, product, lastMessage } = conversation;
  const preview =
    lastMessage === null
      ? 'まだメッセージはありません'
      : `${lastMessage.senderId === viewerId ? 'あなた: ' : ''}${lastMessage.body}`;

  return (
    <Link href={{ pathname: '/messages/[id]', params: { id: conversation.id } }} asChild>
      <Pressable accessibilityLabel={`${otherUser.name}とのメッセージ`}>
        {({ pressed }) => (
          <View style={[styles.container, pressed && styles.pressed]}>
            <UserAvatar uri={otherUser.avatarUrl} size={48} name={otherUser.name} />
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {otherUser.name}
                </Text>
                <Text style={styles.time}>{formatDateTime(lastMessage?.createdAt ?? conversation.updatedAt)}</Text>
              </View>
              {product !== null && (
                <Text style={styles.product} numberOfLines={1}>
                  {product.name}
                </Text>
              )}
              <Text style={styles.preview} numberOfLines={1}>
                {preview}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.subheading,
    flex: 1,
    color: colors.textPrimary,
  },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  product: {
    ...typography.caption,
    color: colors.accent,
  },
  preview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
