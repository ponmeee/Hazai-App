import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export function Logo() {
  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel="はざい箱">
      <MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.accent} />
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
  text: {
    ...typography.title,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
});
