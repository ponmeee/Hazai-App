import { ScrollView, StyleSheet, View } from 'react-native';

import { layout, spacing } from '@/theme';

import { SoftChip } from './SoftChip';

export type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type ChipSelectorProps<T extends string> = {
  options: ChipOption<T>[];
  isSelected: (value: T) => boolean;
  onPress: (value: T) => void;
  /** scroll: 1行で横にスクロールさせる（画面端まで広げるため、左右に画面余白がある場所で使う） */
  layout?: 'wrap' | 'scroll';
  shape?: 'pill' | 'square';
};

/** フォームの選択肢。単一選択・複数選択どちらも呼び出し側の判定で扱う */
export function ChipSelector<T extends string>({
  options,
  isSelected,
  onPress,
  layout: chipLayout = 'wrap',
  shape = 'pill',
}: ChipSelectorProps<T>) {
  const chips = options.map((option) => (
    <SoftChip
      key={option.value}
      label={option.label}
      selected={isSelected(option.value)}
      onPress={() => onPress(option.value)}
      shape={shape}
    />
  ));

  if (chipLayout === 'scroll') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {chips}
      </ScrollView>
    );
  }

  return <View style={styles.wrap}>{chips}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  scroll: {
    marginHorizontal: -layout.screenPaddingX,
  },
  scrollContent: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingX,
  },
});
