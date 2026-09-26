import { useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { leaveAuthScreen } from '@/features/auth/navigation';
import { validateLogin, type LoginErrors } from '@/features/auth/validation';
import { colors, fontWeights, layout, radius, spacing, typography } from '@/theme';
import { goBackOr } from '@/utils/navigation';

// 画像素材の縦横比（左上の三角 361×334、ロゴ文字 646×294、箱のマーク 305×336、下の波 1026×511）
const CORNER_WIDTH = 188;
const CORNER_HEIGHT = CORNER_WIDTH * (334 / 361);
const LOGO_TYPE_WIDTH = 240;
const LOGO_MARK_WIDTH = 106;
// デザインのボタン列の幅
const FORM_MAX_WIDTH = 266;

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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.corner}>
          <Image
            source={require('../../../assets/images/auth/corner.png')}
            contentFit="fill"
            style={styles.cornerImage}
          />
          {/* 起動時はホームの上に重ねて出すため、閉じるとホーム（または開く前の画面）に戻る */}
          <Pressable
            onPress={() => goBackOr('/')}
            accessibilityRole="button"
            accessibilityLabel="閉じる（ログインせずに閲覧する）"
            hitSlop={spacing.sm}
            style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}
          >
            <Ionicons name="close" size={24} color={colors.textOnDark} />
            <Text style={styles.closeHint}>← 閲覧はこちらから</Text>
          </Pressable>
        </View>

        <View style={styles.brand} accessible accessibilityRole="header" accessibilityLabel="はざい箱">
          <Image
            source={require('../../../assets/images/auth/logo-type.png')}
            contentFit="contain"
            style={styles.logoType}
          />
          <Image
            source={require('../../../assets/images/auth/logo-mark.png')}
            contentFit="contain"
            style={styles.logoMark}
          />
        </View>

        <View style={styles.form}>
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

          <View style={styles.actions}>
            {mutation.isError && <Text style={styles.submitError}>{getErrorMessage(mutation.error)}</Text>}
            <PrimaryButton
              label={mutation.isPending ? 'ログイン中…' : 'ログイン'}
              variant="secondary"
              onPress={submit}
              disabled={mutation.isPending}
              style={[styles.button, styles.outlinedButton]}
            />
            <PrimaryButton
              label="新規登録"
              onPress={() => router.push('/register')}
              style={styles.button}
            />
          </View>
        </View>

        <View style={styles.waveArea}>
          <Image source={require('../../../assets/images/auth/wave.png')} contentFit="fill" style={styles.wave} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  corner: {
    width: CORNER_WIDTH,
    height: CORNER_HEIGHT,
  },
  cornerImage: {
    ...StyleSheet.absoluteFill,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  closePressed: {
    opacity: 0.6,
  },
  closeHint: {
    ...typography.caption,
    ...fontWeights.bold,
    color: colors.textOnDark,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  logoType: {
    width: LOGO_TYPE_WIDTH,
    aspectRatio: 646 / 294,
    flexShrink: 1,
  },
  logoMark: {
    width: LOGO_MARK_WIDTH,
    aspectRatio: 305 / 336,
  },
  form: {
    width: '100%',
    maxWidth: FORM_MAX_WIDTH + layout.screenPaddingX * 2,
    alignSelf: 'center',
    gap: spacing.lg,
    marginTop: spacing.xxxl,
    paddingHorizontal: layout.screenPaddingX,
  },
  actions: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  submitError: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
  button: {
    borderRadius: radius.xs,
  },
  outlinedButton: {
    borderWidth: 4,
  },
  // 画面が縦に長いときは波を最下部に寄せる
  waveArea: {
    marginTop: 'auto',
    paddingTop: spacing.xxl,
  },
  wave: {
    width: '100%',
    aspectRatio: 1026 / 511,
  },
});
