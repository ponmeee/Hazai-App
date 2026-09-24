import { unwrap } from '@/api/errors';
import { GALLERY_POST_SELECT, toGalleryPost } from '@/api/mappers';
import type { GalleryPostFilter } from '@/api/queryKeys';
import { supabase } from '@/lib/supabase/client';
import type { CategorySlug, GalleryPost } from '@/types/models';

export async function fetchGalleryPosts({ categorySlug, authorId, limit }: GalleryPostFilter): Promise<GalleryPost[]> {
  let query = supabase.from('gallery_posts').select(GALLERY_POST_SELECT).order('created_at', { ascending: false });
  if (categorySlug !== undefined) query = query.eq('category', categorySlug);
  if (authorId !== undefined) query = query.eq('author_id', authorId);
  if (limit !== undefined) query = query.limit(limit);
  return unwrap(await query).map(toGalleryPost);
}

async function fetchGalleryPost(id: string): Promise<GalleryPost> {
  return toGalleryPost(unwrap(await supabase.from('gallery_posts').select(GALLERY_POST_SELECT).eq('id', id).single()));
}

export type NewGalleryPostInput = {
  title: string;
  body: string;
  categorySlug: CategorySlug;
};

/** 作品と画像（Storage にアップロード済みのパス。先頭が一覧に表示される）を 1 トランザクションで登録する */
export async function createGalleryPost(input: NewGalleryPostInput, imagePaths: string[]): Promise<GalleryPost> {
  const id = unwrap(
    await supabase.rpc('create_gallery_post', {
      p_title: input.title,
      p_description: input.body,
      p_category: input.categorySlug,
      p_image_paths: imagePaths,
    }),
  );
  return fetchGalleryPost(id);
}
