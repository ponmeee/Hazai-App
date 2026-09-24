import { useMutation } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { FormInput } from '@/components/FormInput';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SuccessState } from '@/components/SuccessState';
import type { RegisterInput } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { AvatarPickerField } from '@/features/auth/components/AvatarPickerField';
import { leaveAuthScreen } from '@/features/auth/navigation';
import { PASSWORD_MIN_LENGTH, validateRegister, type RegisterErrors } from '@/features/auth/validation';
import type { PickedImage } from '@/features/uploads/pickImages';
import { shrinkImage } from '@/features/uploads/shrinkImage';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { colors, fontWeights, layout, spacing, typography } from '@/theme';

const initialInput: RegisterInput = { email: '', password: '', name: '', location: '', genre: '', bio: '' };

// 登録直後は端末に一時保存するため、アイコンは表示に十分な大きさまで縮めておく
const AVATAR_MAX_SIZE = 512;
const BIO_MAX_LENGTH = 300;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [input, setInput] = useState<RegisterInput>(initialInput);
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [notice, showNotice] = useTransientMessage();

  const mutation = useMutation({
    mutationFn: async (submitted: RegisterInput) =>
      signUp(submitted, avatar === null ? undefined : await shrinkImage(avatar, AVATAR_MAX_SIZE)),
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
    const nextErrors = validateRegister(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) mutation.mutate({ ...input, email: input.email.trim() });
  };

  if (confirmationEmail !== null) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header showBack title="新規登録" />
        <SuccessState
          title="確認メールを送信しました"
          description={`${confirmationEmail} に届いたメールのリンクを開くと、登録が完了してログインできます。${
            avatar === null ? '' : 'アイコンの写真は、この端末で最初にログインしたときに設定されます。'
          }`}
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
          label="メールアドレス"
          required
          value={input.email}
          onChangeText={setField('email')}
          placeholder="example@hazai.jp"
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
          placeholder={`${PASSWORD_MIN_LENGTH}文字以上`}
          secureTextEntry
          autoComplete="new-password"
          error={errors.password}
        />

        <AvatarPickerField image={avatar} onChange={setAvatar} onPickError={showNotice} />
        <FormInput
          label="ユーザーネーム"
          required
          value={input.name}
          onChangeText={setField('name')}
          placeholder="ニックネームを入力"
          maxLength={30}
          error={errors.name}
        />
        <FormInput
          label="所在地"
          value={input.location}
          onChangeText={setField('location')}
          placeholder="所在地を入力"
          maxLength={30}
        />
        <FormInput
          label="属性"
          required
          value={input.genre}
          onChangeText={setField('genre')}
          placeholder="例：木工、美大生、ハンドメイド"
          maxLength={30}
          error={errors.genre}
        />
        <FormInput
          label="自己紹介"
          multiline
          value={input.bio}
          onChangeText={setField('bio')}
          placeholder="例：普段何を作っているか、どのような作品が好きか"
          maxLength={BIO_MAX_LENGTH}
        />

        <View style={styles.actions}>
          {notice !== null && <Notice message={notice} />}
          {mutation.isError && <Text style={styles.submitError}>{getErrorMessage(mutation.error)}</Text>}
          <PrimaryButton
            label={mutation.isPending ? '登録中…' : 'この内容で登録する'}
            onPress={submit}
            disabled={mutation.isPending}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>アカウントをお持ちの方は</Text>
            <Link href="/login" replace style={styles.switchLink}>
              ログイン
            </Link>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  actions: {
    gap: spacing.lg,
    marginTop: spacing.xl,
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
