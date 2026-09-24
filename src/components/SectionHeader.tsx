import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing, typography } from '@/theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  actionHref?: Href;
};

export function SectionHeader({ title, actionLabel = 'もっとみる', actionHref }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {actionHref !== undefined && (
        <Link href={actionHref} asChild>
          <Pressable style={styles.action} hitSlop={spacing.sm}>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.textTertiary} />
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingX,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  actionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
