import { apiRequest } from '@/api/client';
import type { GalleryPostDto } from '@/api/dto';
import { toGalleryPost } from '@/api/mappers';
import type { GalleryPostFilter } from '@/api/queryKeys';
import type { GalleryPost } from '@/types/models';

export const fetchGalleryPosts = async ({ categorySlug, authorId }: GalleryPostFilter): Promise<GalleryPost[]> =>
  (
    await apiRequest<GalleryPostDto[]>('/gallery-posts', { query: { category: categorySlug, authorId } })
  ).map(toGalleryPost);
