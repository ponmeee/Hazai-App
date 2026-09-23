import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing, typography } from '@/theme';

export type MyPageTab = 'gallery' | 'settings';

const tabs: { key: MyPageTab; label: string }[] = [
  { key: 'gallery', label: '自分のギャラリー' },
  { key: 'settings', label: '個人設定' },
];

type MyPageTabsProps = {
  selected: MyPageTab;
  onSelect: (tab: MyPageTab) => void;
};

export function MyPageTabs({ selected, onSelect }: MyPageTabsProps) {
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
