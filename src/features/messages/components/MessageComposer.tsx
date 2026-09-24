import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '@/theme';

const DEFAULT_MAX_LENGTH = 1000;

type MessageComposerProps = {
  isSending: boolean;
  /** 送信に成功したら true を返し、入力欄を空にする */
  onSend: (body: string) => Promise<boolean>;
  /** 入力欄の案内文。読み上げのラベルにも使う */
  placeholder?: string;
  maxLength?: number;
};

export function MessageComposer({
  isSending,
  onSend,
  placeholder = 'メッセージを入力',
  maxLength = DEFAULT_MAX_LENGTH,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const canSend = text.trim() !== '' && !isSending;

  const send = async () => {
    if (!canSend) return;
    if (await onSend(text.trim())) setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline
        maxLength={maxLength}
        accessibilityLabel={placeholder}
        style={styles.input}
      />
      <Pressable
        onPress={() => void send()}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="送信"
        accessibilityState={{ disabled: !canSend }}
        style={[styles.sendButton, !canSend && styles.sendDisabled]}
      >
        <Ionicons name="arrow-up" size={20} color={colors.textOnDark} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingX,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    ...typography.body,
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  sendDisabled: {
    backgroundColor: colors.border,
  },
});
