import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { spacing } from '@/theme';

export type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type ChipSelectorProps<T extends string> = {
  options: ChipOption<T>[];
  isSelected: (value: T) => boolean;
  onPress: (value: T) => void;
};

/** 折り返して並ぶ選択肢。単一選択・複数選択どちらも呼び出し側の判定で扱う */
export function ChipSelector<T extends string>({ options, isSelected, onPress }: ChipSelectorProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={isSelected(option.value)}
          onPress={() => onPress(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
