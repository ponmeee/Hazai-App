import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = '素材・作品をさがす',
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={16} color={colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        accessibilityLabel="検索"
        style={styles.input}
      />
      {value !== '' && (
        <Pressable onPress={() => onChangeText('')} accessibilityLabel="検索語を消す" hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  input: {
    ...typography.input,
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
  },
});
