import type { Href } from 'expo-router';

import type { GalleryPostFilter } from '@/api/queryKeys';
import { isCategorySlug } from '@/features/categories/queries';

/**
 * 作品詳細で左右にスライドしたときに前後へ並べる一覧の条件。
 * 開いた元の一覧（ギャラリーのカテゴリ絞り込み、マイページの自分の作品など）と同じ並びにする。
 * 指定がなければ全作品の新しい順。
 */
export type PostFeed = Pick<GalleryPostFilter, 'categorySlug' | 'authorId'>;

export const postDetailHref = (postId: string, feed: PostFeed = {}): Href => ({
  pathname: '/posts/[id]',
  params: {
    id: postId,
    ...(feed.categorySlug === undefined ? {} : { category: feed.categorySlug }),
    ...(feed.authorId === undefined ? {} : { authorId: feed.authorId }),
  },
});

/** URL の category / authorId から一覧の条件を復元する。不正な値は無視する */
export const parsePostFeed = (params: { category?: string; authorId?: string }): PostFeed => ({
  ...(params.category !== undefined && isCategorySlug(params.category) ? { categorySlug: params.category } : {}),
  ...(params.authorId !== undefined && params.authorId !== '' ? { authorId: params.authorId } : {}),
});
