import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/UserAvatar';
import { colors, layout, spacing, typography } from '@/theme';
import type { UserSummary } from '@/types/models';

import { FollowButton } from './FollowButton';

type UserRowProps = {
  user: UserSummary;
  onFollowError?: (error: unknown) => void;
};

/** フォロー・フォロワー一覧の 1 行。名前を押すとプロフィールへ */
export function UserRow({ user, onFollowError }: UserRowProps) {
  const meta = [user.location, user.genre].filter((value) => value !== '').join(' / ');

  return (
    <View style={styles.container}>
      <Link href={{ pathname: '/users/[id]', params: { id: user.id } }} asChild>
        <Pressable accessibilityLabel={`${user.name}のプロフィール`} style={styles.link}>
          {({ pressed }) => (
            <View style={[styles.profile, pressed && styles.pressed]}>
              <UserAvatar uri={user.avatarUrl} size={44} name={user.name} />
              <View style={styles.text}>
                <Text style={styles.name} numberOfLines={1}>
                  {user.name}
                </Text>
                {meta !== '' && (
                  <Text style={styles.meta} numberOfLines={1}>
                    {meta}
                  </Text>
                )}
              </View>
            </View>
          )}
        </Pressable>
      </Link>
      <FollowButton userId={user.id} onError={onFollowError} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.md,
  },
  link: {
    flex: 1,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
