import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

import { CreateMenuSheet } from './CreateMenuSheet';

const BUTTON_SIZE = 48;

/** タブバー中央のプラスボタン。画面は切り替えず、出品・投稿のメニューを開く */
export function CreateTabButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={() => setIsMenuOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="出品・投稿する"
        hitSlop={4}
      >
        {({ pressed }) => (
          <View style={[styles.button, pressed && styles.pressed]}>
            <Ionicons name="add" size={32} color={colors.textTertiary} />
          </View>
        )}
      </Pressable>
      <CreateMenuSheet visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: radius.full,
    borderWidth: 2.5,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
