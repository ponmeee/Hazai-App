import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { MAX_TAGS, mergeTags, parseTags } from '@/utils/hashtags';

import { FormField } from './FormField';
import { HashtagChip } from './HashtagChip';

type HashtagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  /** 狭い場所（作品の端材カードなど）ではラベルを出さない */
  compact?: boolean;
};

/** 入力した語を、スペース・読点・Enter で区切ってハッシュタグにする */
export function HashtagInput({
  tags,
  onChange,
  label = 'ハッシュタグ',
  hint,
  error,
  placeholder = '例：栗 広葉樹',
  compact = false,
}: HashtagInputProps) {
  const [draft, setDraft] = useState('');
  const isFull = tags.length >= MAX_TAGS;

  const commit = (text: string) => {
    const added = parseTags(text);
    if (added.length > 0) onChange(mergeTags(tags, added));
    setDraft('');
  };

  const handleChangeText = (text: string) => {
    // 区切り文字を入力した時点で、それまでの語をタグにする
    if (/[\s,、]$/.test(text)) {
      commit(text);
    } else {
      setDraft(text);
    }
  };

  const field = (
    <View style={[styles.box, compact && styles.boxCompact, error !== undefined && styles.invalid]}>
      {tags.map((tag) => (
        <HashtagChip key={tag} tag={tag} onRemove={() => onChange(tags.filter((current) => current !== tag))} />
      ))}
      {!isFull && (
        <TextInput
          value={draft}
          onChangeText={handleChangeText}
          onSubmitEditing={() => commit(draft)}
          onBlur={() => commit(draft)}
          placeholder={tags.length === 0 ? placeholder : '追加'}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={label}
          autoCapitalize="none"
          returnKeyType="done"
          blurOnSubmit={false}
          style={[styles.input, compact && styles.inputCompact]}
        />
      )}
    </View>
  );

  if (compact) return field;

  return (
    <FormField label={label} error={error} hint={hint ?? `スペースや Enter で区切ります（${MAX_TAGS}個まで）`}>
      {field}
    </FormField>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 44,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  boxCompact: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  invalid: {
    borderColor: colors.danger,
  },
  input: {
    ...typography.input,
    flexGrow: 1,
    minWidth: 80,
    paddingVertical: 0,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  inputCompact: {
    ...typography.caption,
    minWidth: 48,
  },
});
