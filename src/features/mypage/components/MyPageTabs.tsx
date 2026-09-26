import { UnderlineTabs } from '@/components/UnderlineTabs';

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
  return <UnderlineTabs tabs={tabs} selected={selected} onSelect={onSelect} />;
}
