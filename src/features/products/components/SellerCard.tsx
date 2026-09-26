import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { UserAvatar } from '@/components/UserAvatar';
import { colors, radius, spacing, typography } from '@/theme';
import { FollowButton } from '@/features/users/components/FollowButton';
import type { UserSummary } from '@/types/models';

type SellerCardProps = {
  seller: UserSummary;
  /** 自分の出品では問い合わせボタンを出さないため省略できる */
  onContact?: () => void;
  isContacting?: boolean;
};

export function SellerCard({ seller, onContact, isContacting = false }: SellerCardProps) {
  const meta = [seller.location, seller.genre].filter((value) => value !== '').join(' / ');

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Link href={{ pathname: '/users/[id]', params: { id: seller.id } }} asChild>
          <Pressable accessibilityLabel={`${seller.name}のプロフィール`} style={styles.profileLink}>
            {({ pressed }) => (
              <View style={[styles.profile, pressed && styles.pressed]}>
                <UserAvatar uri={seller.avatarUrl} size={48} name={seller.name} />
                <View style={styles.text}>
                  <Text style={styles.name}>{seller.name}</Text>
                  {meta !== '' && <Text style={styles.meta}>{meta}</Text>}
                </View>
              </View>
            )}
          </Pressable>
        </Link>
        <FollowButton userId={seller.id} />
      </View>
      {onContact !== undefined && (
        <PrimaryButton
          label={isContacting ? '準備中…' : '出品者へ問い合わせる'}
          variant="secondary"
          disabled={isContacting}
          onPress={onContact}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileLink: {
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
