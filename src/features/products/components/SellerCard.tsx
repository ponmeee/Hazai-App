import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { UserAvatar } from '@/components/UserAvatar';
import { colors, radius, spacing, typography } from '@/theme';
import type { User } from '@/types/models';

type SellerCardProps = {
  seller: User;
  onContact: () => void;
};

export function SellerCard({ seller, onContact }: SellerCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <UserAvatar uri={seller.avatarUrl} size={48} name={seller.name} />
        <View style={styles.text}>
          <Text style={styles.name}>{seller.name}</Text>
          <Text style={styles.meta}>
            {seller.location} / {seller.genre}
          </Text>
        </View>
      </View>
      <PrimaryButton label="出品者へ問い合わせる" variant="secondary" onPress={onContact} />
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
