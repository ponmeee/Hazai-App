import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export function Logo() {
  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel="はざい箱">
      <Image
        source={require('../../../../assets/images/logo.png')}
        contentFit="contain"
        tintColor={colors.textPrimary}
        style={styles.mark}
      />
      <Text style={styles.text}>はざい箱</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // ロゴ画像（305 × 336）の縦横比を保つ
  mark: {
    width: 27,
    height: 30,
  },
  text: {
    ...typography.subheading,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
});
