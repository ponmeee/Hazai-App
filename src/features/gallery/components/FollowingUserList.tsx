import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/UserAvatar';
import { colors, layout, spacing, typography } from '@/theme';
import type { UserSummary } from '@/types/models';

type FollowingUserListProps = {
  users: UserSummary[];
};

const AVATAR_SIZE = 100;

export function FollowingUserList({ users }: FollowingUserListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        フォロー中
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {users.map((user) => (
          <View key={user.id} style={styles.user}>
            <UserAvatar uri={user.avatarUrl} size={AVATAR_SIZE} name={user.name} />
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
    ...typography.sectionTitle,
    color: colors.textPrimary,
    paddingHorizontal: layout.screenPaddingX,
  },
  list: {
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingX,
  },
  user: {
    width: AVATAR_SIZE,
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});
