import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys, type GalleryPostFilter } from '@/api/queryKeys';

import { fetchGalleryPosts } from './api';

export const useGalleryPosts = (filter: GalleryPostFilter, { enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.galleryPosts.list(filter),
    queryFn: () => fetchGalleryPosts(filter),
    placeholderData: keepPreviousData,
    enabled,
  });
