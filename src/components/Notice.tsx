import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type NoticeProps = {
  message: string;
};

/** Web では Alert が表示されないため、操作結果はこのインライン通知で伝える */
export function Notice({ message }: NoticeProps) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  },
  text: {
    ...typography.label,
    color: colors.textOnDark,
  },
});
