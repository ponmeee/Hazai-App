import type { CategorySlug } from '@/types/models';

export type ProductListFilter = {
  categorySlug?: CategorySlug;
  keyword?: string;
};

export type GalleryPostFilter = {
  categorySlug?: CategorySlug;
  authorId?: string;
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
    list: (filter: GalleryPostFilter) => ['galleryPosts', filter] as const,
  },
  viewer: {
    all: ['viewer'] as const,
    following: ['viewer', 'following'] as const,
    conversations: ['viewer', 'conversations'] as const,
    conversation: (id: string) => ['viewer', 'conversations', id] as const,
    messages: (conversationId: string) => ['viewer', 'messages', conversationId] as const,
  },
  demoAccounts: ['dev', 'demoAccounts'] as const,
};
