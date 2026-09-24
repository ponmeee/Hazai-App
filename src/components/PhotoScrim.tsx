import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

// デザインの linear-gradient(240deg) を縦長カードの座標に換算した始点・終点（範囲外の値も有効）
const START = { x: 1.26, y: 0.25 };
const END = { x: -0.26, y: 0.75 };

/** 写真の左下に文字を載せるための暗いグラデーション。写真の上に重ねて使う */
export function PhotoScrim() {
  return (
    <LinearGradient
      colors={[colors.scrimClear, colors.scrimClear, colors.scrim]}
      locations={[0.25, 0.525, 0.75]}
      start={START}
      end={END}
      style={styles.scrim}
    />
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
});
