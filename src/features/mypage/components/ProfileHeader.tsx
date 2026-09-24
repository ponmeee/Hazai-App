import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/UserAvatar';
import { colors, layout, radius, spacing, typography } from '@/theme';
import type { UserProfile } from '@/types/models';

type ProfileHeaderProps = {
  user: UserProfile;
  onEdit: () => void;
};

export function ProfileHeader({ user, onEdit }: ProfileHeaderProps) {
  const meta = [user.location, user.genre].filter((value) => value !== '').join(' / ');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <UserAvatar uri={user.avatarUrl} size={72} name={user.name} />
        <View style={styles.identity}>
          <Text style={styles.name}>{user.name}</Text>
          {meta !== '' && <Text style={styles.meta}>{meta}</Text>}
        </View>
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="プロフィールを編集"
          style={({ pressed }) => [styles.editButton, pressed && styles.editPressed]}
        >
          <Text style={styles.editLabel}>編集</Text>
        </Pressable>
      </View>
      {user.bio !== '' && <Text style={styles.bio}>{user.bio}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingX,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  identity: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  editButton: {
    height: 32,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  editPressed: {
    backgroundColor: colors.surface,
  },
  editLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  bio: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
