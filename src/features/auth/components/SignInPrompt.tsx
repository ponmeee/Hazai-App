import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, layout, spacing, typography } from '@/theme';

type SignInPromptProps = {
  title?: string;
  description: string;
};

export function SignInPrompt({ title = 'ログインが必要です', description }: SignInPromptProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={56} color={colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.actions}>
        <PrimaryButton label="ログイン" onPress={() => router.push('/login')} />
        <PrimaryButton label="新規登録" variant="secondary" onPress={() => router.push('/register')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.xxxl,
  },
  title: {
    ...typography.heading,
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
    marginTop: spacing.lg,
  },
});
