import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/UserAvatar';
import { colors, layout, spacing, typography } from '@/theme';
import type { UserSummary } from '@/types/models';

type FollowingUserListProps = {
  users: UserSummary[];
};

export function FollowingUserList({ users }: FollowingUserListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>フォロー中</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {users.map((user) => (
          <View key={user.id} style={styles.user}>
            <UserAvatar uri={user.avatarUrl} size={56} name={user.name} />
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
    paddingHorizontal: layout.screenPaddingX,
  },
  list: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingX,
  },
  user: {
    width: 64,
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});
