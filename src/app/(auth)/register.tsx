import { useMutation } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/client';
import { FormInput } from '@/components/FormInput';
import { Header } from '@/components/Header';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
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

  const mutation = useMutation({ mutationFn: signUp, onSuccess: leaveAuthScreen });

  const setField = (key: keyof RegisterInput) => (value: string) =>
    setInput((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const nextErrors = validateRegister(input.email, input.password, input.name);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) mutation.mutate({ ...input, email: input.email.trim() });
  };

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
