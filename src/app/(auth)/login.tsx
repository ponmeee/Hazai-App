import { useMutation } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/client';
import { FormInput } from '@/components/FormInput';
import { Header } from '@/components/Header';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { DemoAccountList } from '@/features/auth/components/DemoAccountList';
import { leaveAuthScreen } from '@/features/auth/navigation';
import { validateLogin, type LoginErrors } from '@/features/auth/validation';
import { colors, fontWeights, layout, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});

  const mutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      signIn(credentials.email, credentials.password),
    onSuccess: leaveAuthScreen,
  });

  const submit = () => {
    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) mutation.mutate({ email: email.trim(), password });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="ログイン" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormInput
          label="メールアドレス"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          error={errors.email}
        />
        <FormInput
          label="パスワード"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          onSubmitEditing={submit}
          error={errors.password}
        />

        {mutation.isError && <Text style={styles.submitError}>{getErrorMessage(mutation.error)}</Text>}
        <PrimaryButton
          label={mutation.isPending ? 'ログイン中…' : 'ログイン'}
          onPress={submit}
          disabled={mutation.isPending}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>アカウントをお持ちでない方は</Text>
          <Link href="/register" replace style={styles.switchLink}>
            新規登録
          </Link>
        </View>

        <DemoAccountList
          disabled={mutation.isPending}
          onSelect={(demoEmail, demoPassword) => mutation.mutate({ email: demoEmail, password: demoPassword })}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  submitError: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  switchText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  switchLink: {
    ...typography.bodySmall,
    ...fontWeights.bold,
    color: colors.accent,
  },
});
