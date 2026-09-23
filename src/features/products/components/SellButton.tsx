import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export function SellButton() {
  return (
    <Link href="/products/new" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel="端材を出品する">
        {({ pressed }) => (
          <View style={[styles.button, pressed && styles.pressed]}>
            <Ionicons name="add" size={16} color={colors.textOnDark} />
            <Text style={styles.label}>出品する</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  pressed: {
    backgroundColor: colors.accentPressed,
  },
  label: {
    ...typography.label,
    color: colors.textOnDark,
  },
});
