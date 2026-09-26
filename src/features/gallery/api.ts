import { AppError, toAppError, unwrap } from '@/api/errors';
import {
  GALLERY_COMMENT_SELECT,
  GALLERY_MATERIAL_COLUMNS,
  GALLERY_POST_SELECT,
  toGalleryComment,
  toGalleryMaterial,
  toGalleryPost,
} from '@/api/mappers';
import type { GalleryPostFilter } from '@/api/queryKeys';
import { supabase } from '@/lib/supabase/client';
import { removeImages } from '@/lib/supabase/storage';
import type { CategorySlug, GalleryComment, GalleryMaterial, GalleryPost } from '@/types/models';

const UNIQUE_VIOLATION = '23505';

export async function fetchGalleryPosts({ categorySlug, authorId, limit }: GalleryPostFilter): Promise<GalleryPost[]> {
  let query = supabase.from('gallery_posts').select(GALLERY_POST_SELECT).order('created_at', { ascending: false });
  if (categorySlug !== undefined) query = query.eq('category', categorySlug);
  if (authorId !== undefined) query = query.eq('author_id', authorId);
  if (limit !== undefined) query = query.limit(limit);
  return unwrap(await query).map(toGalleryPost);
}

export async function fetchGalleryPost(id: string): Promise<GalleryPost> {
  const { data, error } = await supabase.from('gallery_posts').select(GALLERY_POST_SELECT).eq('id', id).maybeSingle();
  if (error !== null) throw toAppError(error);
  if (data === null) throw new AppError('作品が見つかりません');
  return toGalleryPost(data);
}

export type NewGalleryPostInput = {
  title: string;
  body: string;
  categorySlug: CategorySlug;
};

/**
 * 使った端材。出品から選んだものは listingId だけを送り、画像とハッシュタグは DB が出品から写す。
 * 手入力のものは Storage にアップロード済みの画像パスと、入力したハッシュタグを送る。
 */
export type NewGalleryMaterialInput =
  | { listingId: string; name: string }
  | { name: string; imagePath: string | null; tags: string[] };

const toMaterialPayload = (material: NewGalleryMaterialInput) =>
  'listingId' in material
    ? { listing_id: material.listingId, name: material.name }
    : { name: material.name, image_path: material.imagePath, tags: material.tags };

/** 作品・画像（先頭が一覧に表示される）・使った端材を 1 トランザクションで登録する */
export async function createGalleryPost(
  input: NewGalleryPostInput,
  imagePaths: string[],
  materials: NewGalleryMaterialInput[],
): Promise<GalleryPost> {
  const id = unwrap(
    await supabase.rpc('create_gallery_post', {
      p_title: input.title,
      p_description: input.body,
      p_category: input.categorySlug,
      p_image_paths: imagePaths,
      p_materials: materials.map(toMaterialPayload),
    }),
  );
  return fetchGalleryPost(id);
}

export async function fetchGalleryMaterials(postId: string): Promise<GalleryMaterial[]> {
  return unwrap(
    await supabase
      .from('gallery_post_materials')
      .select(GALLERY_MATERIAL_COLUMNS)
      .eq('gallery_post_id', postId)
      .order('sort_order'),
  ).map(toGalleryMaterial);
}

/** 出品そのもの、または同じハッシュタグの端材を使った作品（関連が強い順） */
export async function fetchPostsRelatedToProduct(productId: string, limit: number): Promise<GalleryPost[]> {
  const ranked = unwrap(await supabase.rpc('get_related_gallery_posts', { p_listing_id: productId, p_limit: limit }));
  const ids = ranked.map((row) => row.gallery_post_id);
  if (ids.length === 0) return [];
  const posts = unwrap(await supabase.from('gallery_posts').select(GALLERY_POST_SELECT).in('id', ids)).map(toGalleryPost);
  return ids.flatMap((id) => posts.filter((post) => post.id === id));
}

/** 作品を削除する。画像・いいね・コメントは DB 側で一緒に消え、Storage の画像はその後に片付ける */
export async function deleteGalleryPost(id: string): Promise<void> {
  const images = unwrap(await supabase.from('gallery_images').select('storage_path').eq('gallery_post_id', id));
  // 手入力した端材の画像も投稿者のフォルダにあるため一緒に片付ける（出品から写した画像は出品者のものなので消さない）
  const materialImages = unwrap(
    await supabase
      .from('gallery_post_materials')
      .select('image_path')
      .eq('gallery_post_id', id)
      .eq('image_bucket', 'gallery-images'),
  );
  // 他人の作品は RLS により 0 件削除となる
  const deleted = unwrap(await supabase.from('gallery_posts').delete().eq('id', id).select('id'));
  if (deleted.length === 0) throw new AppError('この作品は削除できません');
  await removeImages('gallery-images', [
    ...images.map((image) => image.storage_path),
    ...materialImages.flatMap((material) => (material.image_path === null ? [] : [material.image_path])),
  ]);
}

// ---------------------------------------------------------------------------
// いいね
// ---------------------------------------------------------------------------

/** RLS により自分のいいねだけが返る */
export async function fetchLikedPostIds(): Promise<string[]> {
  const rows = unwrap(await supabase.from('gallery_likes').select('gallery_post_id'));
  return rows.map((row) => row.gallery_post_id);
}

/** user_id は DB の既定値（auth.uid()）で決まるため送らない。いいね済みなら成功とみなす */
export async function likePost(postId: string): Promise<void> {
  const { error } = await supabase.from('gallery_likes').insert({ gallery_post_id: postId });
  if (error !== null && error.code !== UNIQUE_VIOLATION) throw toAppError(error);
}

export async function unlikePost(postId: string): Promise<void> {
  const { error } = await supabase.from('gallery_likes').delete().eq('gallery_post_id', postId);
  if (error !== null) throw toAppError(error);
}

// ---------------------------------------------------------------------------
// コメント
// ---------------------------------------------------------------------------

export async function fetchComments(postId: string): Promise<GalleryComment[]> {
  const rows = unwrap(
    await supabase
      .from('gallery_comments')
      .select(GALLERY_COMMENT_SELECT)
      .eq('gallery_post_id', postId)
      .order('created_at')
      .order('id'),
  );
  return rows.map(toGalleryComment);
}

/** 投稿者は DB の既定値（auth.uid()）で決まるため送らない */
export async function addComment(postId: string, body: string): Promise<GalleryComment> {
  return toGalleryComment(
    unwrap(
      await supabase
        .from('gallery_comments')
        .insert({ gallery_post_id: postId, content: body })
        .select(GALLERY_COMMENT_SELECT)
        .single(),
    ),
  );
}

/** コメントした本人か作品の投稿者だけが削除できる（RLS） */
export async function deleteComment(commentId: string): Promise<void> {
  const deleted = unwrap(await supabase.from('gallery_comments').delete().eq('id', commentId).select('id'));
  if (deleted.length === 0) throw new AppError('このコメントは削除できません');
}
