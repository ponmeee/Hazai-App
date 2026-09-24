import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { queryKeys } from '@/api/queryKeys';
import { UserAvatar } from '@/components/UserAvatar';
import { colors, radius, spacing, typography } from '@/theme';

import { fetchDemoAccounts } from '../api';

type DemoAccountListProps = {
  disabled: boolean;
  onSelect: (email: string, password: string) => void;
};

/** 開発ビルドでのみ表示する。デモアカウントを切り替えて動作確認するため */
export function DemoAccountList({ disabled, onSelect }: DemoAccountListProps) {
  const query = useQuery({ queryKey: queryKeys.demoAccounts, queryFn: fetchDemoAccounts, enabled: __DEV__ });

  if (!__DEV__ || query.data === undefined) return null;
  const { password, accounts } = query.data;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>デモアカウントでログイン（開発用）</Text>
      <View style={styles.list}>
        {accounts.map((account) => (
          <Pressable
            key={account.email}
            disabled={disabled}
            onPress={() => onSelect(account.email, password)}
            accessibilityRole="button"
            accessibilityLabel={`${account.name}でログイン`}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <UserAvatar uri={account.avatarUrl} size={24} name={account.name} />
            <Text style={styles.name}>{account.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemPressed: {
    backgroundColor: colors.accentSoft,
  },
  name: {
    ...typography.label,
    color: colors.textPrimary,
  },
});
