import { apiRequest } from '@/api/client';
import type { GalleryPostDto } from '@/api/dto';
import { toGalleryPost } from '@/api/mappers';
import type { GalleryPostFilter } from '@/api/queryKeys';
import type { CategorySlug, GalleryPost } from '@/types/models';

export const fetchGalleryPosts = async ({ categorySlug, authorId }: GalleryPostFilter): Promise<GalleryPost[]> =>
  (
    await apiRequest<GalleryPostDto[]>('/gallery-posts', { query: { category: categorySlug, authorId } })
  ).map(toGalleryPost);

export type NewGalleryPostInput = {
  title: string;
  body: string;
  categorySlug: CategorySlug;
  /** サーバーへアップロード済みの画像パス。先頭が一覧に表示される */
  imageUrls: string[];
};

export const createGalleryPost = async (input: NewGalleryPostInput): Promise<GalleryPost> =>
  toGalleryPost(await apiRequest<GalleryPostDto>('/gallery-posts', { method: 'POST', body: input }));
