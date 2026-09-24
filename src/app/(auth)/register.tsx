import { useMutation } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { FormInput } from '@/components/FormInput';
import { Header } from '@/components/Header';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/SuccessState';
import type { RegisterInput } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { leaveAuthScreen } from '@/features/auth/navigation';
import { PASSWORD_MIN_LENGTH, validateRegister, type RegisterErrors } from '@/features/auth/validation';
import { colors, fontWeights, layout, spacing, typography } from '@/theme';

const initialInput: RegisterInput = { email: '', password: '', name: '', location: '', genre: '' };

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [input, setInput] = useState<RegisterInput>(initialInput);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: (result, submitted) => {
      if (result.needsEmailConfirmation) {
        setConfirmationEmail(submitted.email);
      } else {
        leaveAuthScreen();
      }
    },
  });

  const setField = (key: keyof RegisterInput) => (value: string) =>
    setInput((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const nextErrors = validateRegister(input.email, input.password, input.name);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) mutation.mutate({ ...input, email: input.email.trim() });
  };

  if (confirmationEmail !== null) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header showBack title="新規登録" />
        <SuccessState
          title="確認メールを送信しました"
          description={`${confirmationEmail} に届いたメールのリンクを開くと、登録が完了してログインできます。`}
          primaryAction={{ label: 'ログイン画面へ', onPress: () => router.replace('/login') }}
          secondaryAction={{ label: 'ホームへ戻る', onPress: () => router.replace('/') }}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title="新規登録" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormInput
          label="名前"
          required
          value={input.name}
          onChangeText={setField('name')}
          placeholder="作家名・ニックネーム"
          maxLength={30}
          error={errors.name}
        />
        <FormInput
          label="メールアドレス"
          required
          value={input.email}
          onChangeText={setField('email')}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          error={errors.email}
        />
        <FormInput
          label="パスワード"
          required
          value={input.password}
          onChangeText={setField('password')}
          secureTextEntry
          autoComplete="new-password"
          hint={`${PASSWORD_MIN_LENGTH}文字以上`}
          error={errors.password}
        />
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormInput
              label="地域"
              value={input.location}
              onChangeText={setField('location')}
              placeholder="例）東京都"
              maxLength={30}
            />
          </View>
          <View style={styles.rowItem}>
            <FormInput
              label="ジャンル"
              value={input.genre}
              onChangeText={setField('genre')}
              placeholder="例）木工"
              maxLength={30}
            />
          </View>
        </View>

        {mutation.isError && <Text style={styles.submitError}>{getErrorMessage(mutation.error)}</Text>}
        <PrimaryButton
          label={mutation.isPending ? '登録中…' : '登録する'}
          onPress={submit}
          disabled={mutation.isPending}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>アカウントをお持ちの方は</Text>
          <Link href="/login" replace style={styles.switchLink}>
            ログイン
          </Link>
        </View>
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
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
