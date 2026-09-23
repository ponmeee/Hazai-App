import { Link, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, typography } from '@/theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  actionHref?: Href;
};

export function SectionHeader({ title, actionLabel = 'すべて見る', actionHref }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {actionHref !== undefined && (
        <Link href={actionHref} style={styles.action}>
          {actionLabel}
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
    ...typography.heading,
    color: colors.textPrimary,
  },
  action: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
