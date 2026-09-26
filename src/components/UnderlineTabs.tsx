import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing, typography } from '@/theme';

type UnderlineTabsProps<T extends string> = {
  tabs: { key: T; label: string }[];
  selected: T;
  onSelect: (tab: T) => void;
};

/** 選択中のタブに下線を引く、横並びのタブ */
export function UnderlineTabs<T extends string>({ tabs, selected, onSelect }: UnderlineTabsProps<T>) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isSelected = tab.key === selected;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={[styles.tab, isSelected && styles.tabSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPaddingX,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: colors.textPrimary,
  },
  label: {
    ...typography.label,
    color: colors.textTertiary,
  },
  labelSelected: {
    color: colors.textPrimary,
  },
});
