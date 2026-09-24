import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IoniconName } from '@/components/IconButton';
import { colors, layout, radius, spacing, typography } from '@/theme';

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
  const insets = useSafeAreaInsets();

  const open = (href: Href) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="閉じる" />
        <View style={[styles.sheet, { paddingBottom: spacing.xl + insets.bottom }]}>
          <View style={styles.handle} />
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlayStrong,
  },
  sheet: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    marginBottom: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
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
