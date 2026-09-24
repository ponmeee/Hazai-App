import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { UserAvatar } from '@/components/UserAvatar';
import { colors, radius, spacing, typography } from '@/theme';
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
      <View style={styles.profile}>
        <UserAvatar uri={seller.avatarUrl} size={48} name={seller.name} />
        <View style={styles.text}>
          <Text style={styles.name}>{seller.name}</Text>
          {meta !== '' && <Text style={styles.meta}>{meta}</Text>}
        </View>
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
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
