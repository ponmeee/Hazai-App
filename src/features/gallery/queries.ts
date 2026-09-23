import { getCategoryName } from '@/features/categories/queries';
import { getUserById } from '@/features/users/queries';
import { galleryPosts } from '@/mocks/galleryPosts';
import type { CategorySlug, GalleryPost, User } from '@/types/models';

export type GalleryPostView = GalleryPost & {
  author: User;
  categoryName: string;
};

const toView = (post: GalleryPost): GalleryPostView[] => {
  const author = getUserById(post.authorId);
  if (author === undefined) return [];
  return [{ ...post, author, categoryName: getCategoryName(post.categorySlug) }];
};

export const getGalleryPosts = (categorySlug?: CategorySlug): GalleryPostView[] =>
  galleryPosts
    .filter((post) => categorySlug === undefined || post.categorySlug === categorySlug)
    .flatMap(toView);

export const getGalleryPostsByAuthor = (authorId: string): GalleryPostView[] =>
  galleryPosts.filter((post) => post.authorId === authorId).flatMap(toView);
