import type { CategorySlug } from '@/types/models';

export type ProductListFilter = {
  categorySlug?: CategorySlug;
  keyword?: string;
};

export type GalleryPostFilter = {
  categorySlug?: CategorySlug;
  authorId?: string;
  /** 新しい順に何件まで取るか。省略時はすべて */
  limit?: number;
};

/**
 * ログイン中のユーザーに固有のデータは viewer 配下に置き、
 * ログイン・ログアウト時にまとめて破棄できるようにしている。
 */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filter: ProductListFilter) => ['products', 'list', filter] as const,
    popular: (limit: number) => ['products', 'popular', limit] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  galleryPosts: {
    all: ['galleryPosts'] as const,
    list: (filter: GalleryPostFilter) => ['galleryPosts', filter] as const,
    detail: (id: string) => ['galleryPosts', 'detail', id] as const,
  },
  // 作品の一覧・詳細（galleryPosts）とは形が異なるため、別の接頭辞にしてまとめて書き換える対象から外す
  galleryComments: (postId: string) => ['galleryComments', postId] as const,
  viewer: {
    all: ['viewer'] as const,
    following: ['viewer', 'following'] as const,
    favoriteProductIds: ['viewer', 'favoriteProductIds'] as const,
    cart: ['viewer', 'cart'] as const,
    likedPostIds: ['viewer', 'likedPostIds'] as const,
    conversations: ['viewer', 'conversations'] as const,
    conversation: (id: string) => ['viewer', 'conversations', id] as const,
    messages: (conversationId: string) => ['viewer', 'messages', conversationId] as const,
  },
};
