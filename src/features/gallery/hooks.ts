import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { queryKeys, type GalleryPostFilter } from '@/api/queryKeys';
import { useAuth } from '@/features/auth/AuthProvider';
import type { GalleryPost } from '@/types/models';

import {
  addComment,
  deleteComment,
  deleteGalleryPost,
  fetchComments,
  fetchGalleryMaterials,
  fetchGalleryPost,
  fetchGalleryPosts,
  fetchPostsRelatedToProduct,
  fetchLikedPostIds,
  likePost,
  unlikePost,
} from './api';

export const useGalleryPosts = (filter: GalleryPostFilter, { enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.galleryPosts.list(filter),
    queryFn: () => fetchGalleryPosts(filter),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useGalleryPost = (id: string) =>
  useQuery({
    queryKey: queryKeys.galleryPosts.detail(id),
    queryFn: () => fetchGalleryPost(id),
  });

export const useGalleryMaterials = (postId: string) =>
  useQuery({
    queryKey: queryKeys.galleryMaterials(postId),
    queryFn: () => fetchGalleryMaterials(postId),
  });

const RELATED_POST_LIMIT = 10;

export const usePostsRelatedToProduct = (productId: string) =>
  useQuery({
    queryKey: queryKeys.galleryPosts.relatedToProduct(productId),
    queryFn: () => fetchPostsRelatedToProduct(productId, RELATED_POST_LIMIT),
  });

export const useDeleteGalleryPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGalleryPost,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.galleryPosts.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleryPosts.all });
    },
  });
};

/** 一覧・詳細のキャッシュにある同じ作品の件数を、再取得を待たずに書き換える */
function adjustPostCounts(queryClient: QueryClient, postId: string, delta: { likes?: number; comments?: number }) {
  const adjust = (post: GalleryPost): GalleryPost =>
    post.id === postId
      ? {
          ...post,
          likeCount: Math.max(post.likeCount + (delta.likes ?? 0), 0),
          commentCount: Math.max(post.commentCount + (delta.comments ?? 0), 0),
        }
      : post;
  queryClient.setQueriesData<GalleryPost | GalleryPost[]>({ queryKey: queryKeys.galleryPosts.all }, (data) => {
    if (data === undefined) return data;
    return Array.isArray(data) ? data.map(adjust) : adjust(data);
  });
}

// ---------------------------------------------------------------------------
// いいね
// ---------------------------------------------------------------------------

const likedIdsKey = queryKeys.viewer.likedPostIds;

export const useLikedPostIds = () => {
  const { status } = useAuth();
  return useQuery({
    queryKey: likedIdsKey,
    queryFn: fetchLikedPostIds,
    enabled: status === 'signedIn',
  });
};

const useSetLiked = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? likePost(postId) : unlikePost(postId),
    // ♡ と件数は押した瞬間に切り替え、失敗したときだけ元に戻す
    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: likedIdsKey });
      const previous = queryClient.getQueryData<string[]>(likedIdsKey);
      queryClient.setQueryData<string[]>(likedIdsKey, (ids = []) => {
        const others = ids.filter((id) => id !== postId);
        return liked ? [postId, ...others] : others;
      });
      adjustPostCounts(queryClient, postId, { likes: liked ? 1 : -1 });
      return { previous };
    },
    onError: (_error, { postId, liked }, context) => {
      queryClient.setQueryData(likedIdsKey, context?.previous);
      adjustPostCounts(queryClient, postId, { likes: liked ? -1 : 1 });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: likedIdsKey });
      // 表示中の一覧が指の下で並び替わらないよう、件数の再取得は次に開いたときに行う
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleryPosts.all, refetchType: 'none' });
    },
  });
};

/** 作品にいいね済みかと、その切り替え。未ログインならログイン画面へ */
export function usePostLike(postId: string) {
  const { status } = useAuth();
  const { data: likedIds } = useLikedPostIds();
  const setLiked = useSetLiked();

  const isLiked = likedIds?.includes(postId) ?? false;

  const toggle = (onError?: (error: unknown) => void) => {
    if (status !== 'signedIn') {
      router.push('/login');
      return;
    }
    setLiked.mutate({ postId, liked: !isLiked }, { onError });
  };

  return { isLiked, toggle };
}

// ---------------------------------------------------------------------------
// コメント
// ---------------------------------------------------------------------------

export const useComments = (postId: string) =>
  useQuery({
    queryKey: queryKeys.galleryComments(postId),
    queryFn: () => fetchComments(postId),
  });

export const useAddComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addComment(postId, body),
    onSuccess: () => {
      adjustPostCounts(queryClient, postId, { comments: 1 });
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleryComments(postId) });
    },
  });
};

export const useDeleteComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      adjustPostCounts(queryClient, postId, { comments: -1 });
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleryComments(postId) });
    },
  });
};
