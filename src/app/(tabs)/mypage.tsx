import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { GalleryPostTile } from '@/components/GalleryPostTile';
import { Header } from '@/components/Header';
import { IconButton } from '@/components/IconButton';
import { Notice } from '@/components/Notice';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { TwoColumnGrid } from '@/components/TwoColumnGrid';
import { useAuth } from '@/features/auth/AuthProvider';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { useGalleryPosts } from '@/features/gallery/hooks';
import { MyPageTabs, type MyPageTab } from '@/features/mypage/components/MyPageTabs';
import { ProfileHeader } from '@/features/mypage/components/ProfileHeader';
import { ProfileStats } from '@/features/mypage/components/ProfileStats';
import { SettingsPanel } from '@/features/mypage/components/SettingsPanel';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { layout, spacing } from '@/theme';
import type { Account } from '@/types/models';

function MyPageContent({ account }: { account: Account }) {
  const { signOut } = useAuth();
  const postsQuery = useGalleryPosts({ authorId: account.id });
  const [selectedTab, setSelectedTab] = useState<MyPageTab>('gallery');
  const [notice, showNotice] = useTransientMessage();

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileHeader user={account} onEdit={() => router.push('/profile/edit')} />
        <ProfileStats user={account} />
        <MyPageTabs selected={selectedTab} onSelect={setSelectedTab} />

        {selectedTab === 'gallery' ? (
          <QueryView query={postsQuery}>
            {(posts) =>
              posts.length === 0 ? (
                <EmptyState title="まだ作品を投稿していません" />
              ) : (
                <TwoColumnGrid
                  items={posts}
                  keyExtractor={(post) => post.id}
                  renderItem={(post) => <GalleryPostTile post={post} />}
                />
              )
            }
          </QueryView>
        ) : (
          <SettingsPanel
            onSelectItem={(feature) => showNotice(`${feature}は準備中です`)}
            onLogout={() => void signOut()}
          />
        )}
      </ScrollView>

      {notice !== null && (
        <View style={styles.noticeContainer}>
          <Notice message={notice} />
        </View>
      )}
    </>
  );
}

export default function MyPageScreen() {
  const { status } = useAuth();

  return (
    <Screen>
      <Header
        title="マイページ"
        right={
          status === 'signedIn' && (
            <View style={styles.headerActions}>
              <IconButton icon="cart-outline" accessibilityLabel="カート" onPress={() => router.push('/cart')} />
              <IconButton
                icon="chatbubbles-outline"
                accessibilityLabel="メッセージ"
                onPress={() => router.push('/messages')}
              />
            </View>
          )
        }
      />
      <RequireAuth
        title="はざい箱へようこそ"
        description="ログインすると、端材の出品や作品の投稿、出品者とのメッセージができます。"
      >
        {(account) => <MyPageContent account={account} />}
      </RequireAuth>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
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
