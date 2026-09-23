import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cube-outline" size={32} color={colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {description !== undefined && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.subheading,
    color: colors.textSecondary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
