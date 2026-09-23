import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { GalleryPostTile } from '@/components/GalleryPostTile';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { Screen } from '@/components/Screen';
import { TwoColumnGrid } from '@/components/TwoColumnGrid';
import { getGalleryPostsByAuthor } from '@/features/gallery/queries';
import { MyPageTabs, type MyPageTab } from '@/features/mypage/components/MyPageTabs';
import { ProfileHeader } from '@/features/mypage/components/ProfileHeader';
import { ProfileStats } from '@/features/mypage/components/ProfileStats';
import { SettingsPanel } from '@/features/mypage/components/SettingsPanel';
import { getCurrentUser } from '@/features/users/queries';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { layout, spacing } from '@/theme';

export default function MyPageScreen() {
  const user = getCurrentUser();
  const posts = getGalleryPostsByAuthor(user.id);
  const [selectedTab, setSelectedTab] = useState<MyPageTab>('gallery');
  const [notice, showNotice] = useTransientMessage();

  const showComingSoon = (feature: string) => showNotice(`${feature}は準備中です`);

  return (
    <Screen>
      <Header title="マイページ" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileHeader user={user} onEdit={() => showComingSoon('プロフィール編集')} />
        <ProfileStats user={user} />
        <MyPageTabs selected={selectedTab} onSelect={setSelectedTab} />

        {selectedTab === 'gallery' ? (
          posts.length === 0 ? (
            <EmptyState title="まだ作品を投稿していません" />
          ) : (
            <TwoColumnGrid
              items={posts}
              keyExtractor={(post) => post.id}
              renderItem={(post) => <GalleryPostTile post={post} />}
            />
          )
        ) : (
          <SettingsPanel onSelectItem={showComingSoon} onLogout={() => showComingSoon('ログアウト')} />
        )}
      </ScrollView>

      {notice !== null && (
        <View style={styles.noticeContainer}>
          <Notice message={notice} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl,
  },
  noticeContainer: {
    position: 'absolute',
    left: layout.screenPaddingX,
    right: layout.screenPaddingX,
    bottom: spacing.lg,
    pointerEvents: 'none',
  },
});
