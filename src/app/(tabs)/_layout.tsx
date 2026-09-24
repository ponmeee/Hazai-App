import { Image, type ImageSource } from 'expo-image';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateTabButton } from '@/features/create/components/CreateTabButton';
import { colors, spacing, typography } from '@/theme';

type TabIconSet = { active: ImageSource; inactive: ImageSource };

// 素材の命名が揃っていないため対応をここで明示する（my_kuro.png が選択中）
const tabIcons = {
  home: { active: require('../../../assets/home.png'), inactive: require('../../../assets/home_gry.png') },
  buy: { active: require('../../../assets/cart.png'), inactive: require('../../../assets/cart_gry.png') },
  gallery: {
    active: require('../../../assets/garary.png'),
    inactive: require('../../../assets/garary_gry.png'),
  },
  mypage: { active: require('../../../assets/my_kuro.png'), inactive: require('../../../assets/my.png') },
} satisfies Record<string, TabIconSet>;

function TabIcon({ icons, focused }: { icons: TabIconSet; focused: boolean }) {
  return (
    <Image
      source={focused ? icons.active : icons.inactive}
      contentFit="contain"
      style={styles.icon}
    />
  );
}

// 中央のプラスボタン（直径 48）が収まる高さ。セーフエリアの分は別に足す
const TAB_BAR_HEIGHT = 60;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.label,
        tabBarStyle: [styles.tabBar, { height: TAB_BAR_HEIGHT + insets.bottom }],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused }) => <TabIcon icons={tabIcons.home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="buy"
        options={{
          title: 'かう',
          tabBarIcon: ({ focused }) => <TabIcon icons={tabIcons.buy} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '出品・投稿',
          tabBarButton: () => <CreateTabButton />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'ギャラリー',
          tabBarIcon: ({ focused }) => <TabIcon icons={tabIcons.gallery} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: 'マイページ',
          tabBarIcon: ({ focused }) => <TabIcon icons={tabIcons.mypage} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: spacing.xs,
    backgroundColor: colors.background,
    borderTopColor: colors.divider,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    ...typography.caption,
    fontSize: 10,
  },
});
