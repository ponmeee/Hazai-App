import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontWeights, radius, spacing, typography } from '@/theme';

import { useFollow } from '../hooks';

type FollowButtonProps = {
  userId: string;
  onError?: (error: unknown) => void;
};

/** フォロー中は枠線、未フォローは塗りのボタン。自分自身には表示しない */
export function FollowButton({ userId, onError }: FollowButtonProps) {
  const { isFollowing, canFollow, isUpdating, toggle } = useFollow(userId);
  if (!canFollow) return null;

  return (
    <Pressable
      onPress={() => toggle(onError)}
      disabled={isUpdating}
      accessibilityRole="button"
      accessibilityState={{ selected: isFollowing, disabled: isUpdating }}
      accessibilityLabel={isFollowing ? 'フォローを解除' : 'フォローする'}
      style={({ pressed }) => [
        styles.button,
        isFollowing ? styles.following : styles.notFollowing,
        (pressed || isUpdating) && styles.pressed,
      ]}
    >
      <Text style={[styles.label, isFollowing ? styles.followingLabel : styles.notFollowingLabel]}>
        {isFollowing ? 'フォロー中' : 'フォローする'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 32,
    minWidth: 96,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFollowing: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  following: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...typography.label,
    ...fontWeights.bold,
  },
  notFollowingLabel: {
    color: colors.textOnDark,
  },
  followingLabel: {
    color: colors.textPrimary,
  },
});
