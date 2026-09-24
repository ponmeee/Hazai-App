import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/theme';

// react-native-web は ON 時のつまみ色に activeThumbColor を使う（RN の型定義には存在しない）
const webSwitchProps: object = Platform.OS === 'web' ? { activeThumbColor: colors.background } : {};

type NotificationKey = 'favoriteMaterials' | 'messages' | 'recommendations';

const accountItems: { label: string; href?: Href }[] = [
  { label: 'プロフィール編集', href: '/profile/edit' },
  { label: 'メールアドレス・パスワード変更' },
  { label: '配送先住所' },
  { label: '購入履歴' },
  { label: '本人確認' },
];

const notificationItems: { key: NotificationKey; label: string }[] = [
  { key: 'favoriteMaterials', label: 'お気に入り素材更新' },
  { key: 'messages', label: 'メッセージ' },
  { key: 'recommendations', label: 'おすすめ / 特集' },
];

const aboutItems = ['利用規約', 'プライバシーポリシー', 'お問い合わせ'];

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

type SettingsRowProps = {
  label: string;
  isFirst: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
};

function SettingsRow({ label, isFirst, trailing, onPress }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole={onPress === undefined ? undefined : 'button'}
      style={({ pressed }) => [styles.row, !isFirst && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      {trailing ?? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
    </Pressable>
  );
}

type SettingsPanelProps = {
  onSelectItem: (label: string) => void;
  onLogout: () => void;
};

export function SettingsPanel({ onSelectItem, onLogout }: SettingsPanelProps) {
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    favoriteMaterials: true,
    messages: true,
    recommendations: false,
  });

  const toggleNotification = (key: NotificationKey) => (value: boolean) =>
    setNotifications((current) => ({ ...current, [key]: value }));

  return (
    <View style={styles.container}>
      <SettingsSection title="アカウント">
        {accountItems.map(({ label, href }, index) => (
          <SettingsRow
            key={label}
            label={label}
            isFirst={index === 0}
            onPress={() => (href === undefined ? onSelectItem(label) : router.push(href))}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="通知">
        {notificationItems.map((item, index) => (
          <SettingsRow
            key={item.key}
            label={item.label}
            isFirst={index === 0}
            trailing={
              <Switch
                value={notifications[item.key]}
                onValueChange={toggleNotification(item.key)}
                trackColor={{ true: colors.accent, false: colors.border }}
                thumbColor={colors.background}
                {...webSwitchProps}
                accessibilityLabel={item.label}
              />
            }
          />
        ))}
      </SettingsSection>

      <SettingsSection title="アプリについて">
        {aboutItems.map((label, index) => (
          <SettingsRow key={label} label={label} isFirst={index === 0} onPress={() => onSelectItem(label)} />
        ))}
        <SettingsRow
          label="バージョン"
          isFirst={false}
          trailing={<Text style={styles.version}>{Constants.expoConfig?.version ?? '-'}</Text>}
        />
      </SettingsSection>

      <Pressable
        onPress={onLogout}
        accessibilityRole="button"
        style={({ pressed }) => [styles.logout, pressed && styles.rowPressed]}
      >
        <Text style={styles.logoutLabel}>ログアウト</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingX,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  sectionBody: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowLabel: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
  },
  version: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  logout: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutLabel: {
    ...typography.subheading,
    color: colors.danger,
  },
});
