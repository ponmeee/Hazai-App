import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

export function LoadingState() {
  return (
    <View style={styles.container} accessibilityLabel="読み込み中">
      <ActivityIndicator color={colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
});
