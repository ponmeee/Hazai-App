import { Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { EmptyState } from '@/components/EmptyState';
import { GalleryPostTile } from '@/components/GalleryPostTile';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import { ProductCard } from '@/components/ProductCard';
import { QueryView } from '@/components/QueryView';
import { Screen } from '@/components/Screen';
import { TwoColumnGrid } from '@/components/TwoColumnGrid';
import { UnderlineTabs } from '@/components/UnderlineTabs';
import { useAuth } from '@/features/auth/AuthProvider';
import { useGalleryPosts } from '@/features/gallery/hooks';
import { ProfileHeader } from '@/features/mypage/components/ProfileHeader';
import { ProfileStats } from '@/features/mypage/components/ProfileStats';
import { useProducts } from '@/features/products/hooks';
import { FollowButton } from '@/features/users/components/FollowButton';
import { useUserProfile } from '@/features/users/hooks';
import { useTransientMessage } from '@/hooks/useTransientMessage';
import { layout, spacing } from '@/theme';
import type { UserProfile } from '@/types/models';

type ProfileTab = 'gallery' | 'listings';

const tabs: { key: ProfileTab; label: string }[] = [
  { key: 'gallery', label: '作品' },
  { key: 'listings', label: '出品中の端材' },
];

function UserGallery({ userId }: { userId: string }) {
  const postsQuery = useGalleryPosts({ authorId: userId });
  return (
    <QueryView query={postsQuery}>
      {(posts) =>
        posts.length === 0 ? (
          <EmptyState title="まだ作品はありません" />
        ) : (
          <TwoColumnGrid
            items={posts}
            keyExtractor={(post) => post.id}
            renderItem={(post) => <GalleryPostTile post={post} feed={{ authorId: userId }} />}
          />
        )
      }
    </QueryView>
  );
}

function UserListings({ userId }: { userId: string }) {
  const productsQuery = useProducts({ sellerId: userId });
  return (
    <QueryView query={productsQuery}>
      {(products) =>
        products.length === 0 ? (
          <EmptyState title="出品中の端材はありません" />
        ) : (
          <TwoColumnGrid
            items={products}
            keyExtractor={(product) => product.id}
            renderItem={(product) => <ProductCard product={product} />}
          />
        )
      }
    </QueryView>
  );
}

function UserProfileContent({ user }: { user: UserProfile }) {
  const [selectedTab, setSelectedTab] = useState<ProfileTab>('gallery');
  const [notice, showNotice] = useTransientMessage();

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          user={user}
          action={<FollowButton userId={user.id} onError={(error) => showNotice(getErrorMessage(error))} />}
        />
        <ProfileStats user={user} />
        <UnderlineTabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
        {selectedTab === 'gallery' ? <UserGallery userId={user.id} /> : <UserListings userId={user.id} />}
      </ScrollView>
      {notice !== null && (
        <View style={styles.noticeContainer}>
          <Notice message={notice} />
        </View>
      )}
    </>
  );
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { account } = useAuth();
  const profileQuery = useUserProfile(id);

  // 自分のプロフィールは編集や設定のあるマイページで見せる
  if (account?.id === id) return <Redirect href="/mypage" />;

  return (
    <Screen edges={['top', 'bottom']}>
      <Header showBack title={profileQuery.data?.name ?? 'プロフィール'} />
      <QueryView query={profileQuery}>{(user) => <UserProfileContent user={user} />}</QueryView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  noticeContainer: {
    position: 'absolute',
    left: layout.screenPaddingX,
    right: layout.screenPaddingX,
    bottom: spacing.xl,
    pointerEvents: 'none',
  },
});
