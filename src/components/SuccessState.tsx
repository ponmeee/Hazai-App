import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing, typography } from '@/theme';

import { PrimaryButton } from './PrimaryButton';

type SuccessAction = {
  label: string;
  onPress: () => void;
};

type SuccessStateProps = {
  title: string;
  description: string;
  primaryAction: SuccessAction;
  secondaryAction: SuccessAction;
};

/** 出品・投稿などが完了した後の画面 */
export function SuccessState({ title, description, primaryAction, secondaryAction }: SuccessStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={56} color={colors.success} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.actions}>
        <PrimaryButton label={primaryAction.label} onPress={primaryAction.onPress} />
        <PrimaryButton label={secondaryAction.label} variant="secondary" onPress={secondaryAction.onPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
