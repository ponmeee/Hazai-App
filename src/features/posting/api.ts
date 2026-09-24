import { createGalleryPost } from '@/features/gallery/api';
import { removeImages, uploadImages } from '@/lib/supabase/storage';
import type { GalleryPost } from '@/types/models';

import type { PostFormValues } from './validatePost';

/** 画像を Storage へアップロードしてから作品を登録する。登録に失敗したら画像を片付ける */
export async function submitPost(values: PostFormValues): Promise<GalleryPost> {
  if (values.categorySlug === null) {
    throw new Error('submitPost は検証済みの入力で呼び出す');
  }

  const imagePaths = await uploadImages('gallery-images', values.images);
  try {
    return await createGalleryPost(
      { title: values.title.trim(), body: values.body.trim(), categorySlug: values.categorySlug },
      imagePaths,
    );
  } catch (error) {
    await removeImages('gallery-images', imagePaths);
    throw error;
  }
}
