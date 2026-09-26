import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import type { IoniconName } from '@/components/IconButton';
import { colors, radius, spacing, typography } from '@/theme';

type CreateMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type CreateOption = {
  icon: IoniconName;
  title: string;
  description: string;
  href: Href;
};

// 端材の出品と作品の投稿は別のフローとして扱う
const createOptions: CreateOption[] = [
  {
    icon: 'cube-outline',
    title: '端材を出品する',
    description: '余った素材を、必要としている人に販売します',
    href: '/products/new',
  },
  {
    icon: 'image-outline',
    title: '作品を投稿する',
    description: '端材からつくった作品をギャラリーで共有します',
    href: '/posts/new',
  },
];

export function CreateMenuSheet({ visible, onClose }: CreateMenuSheetProps) {
  const open = (href: Href) => {
    onClose();
    router.push(href);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {createOptions.map((option) => (
        <Pressable
          key={option.title}
          onPress={() => open(option.href)}
          accessibilityRole="button"
          accessibilityLabel={option.title}
          style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
        >
          <View style={styles.optionIcon}>
            <Ionicons name={option.icon} size={24} color={colors.accent} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>
      ))}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  optionText: {
    flex: 1,
    gap: spacing.xxs,
  },
  optionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
