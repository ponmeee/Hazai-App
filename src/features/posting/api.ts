import { createGalleryPost } from '@/features/gallery/api';
import { uploadImages } from '@/features/uploads/api';
import type { GalleryPost } from '@/types/models';

import type { PostFormValues } from './validatePost';

/** 画像をアップロードしてから、その URL を付けて作品を登録する */
export async function submitPost(values: PostFormValues): Promise<GalleryPost> {
  if (values.categorySlug === null) {
    throw new Error('submitPost は検証済みの入力で呼び出す');
  }

  const imageUrls = await uploadImages(values.images);

  return createGalleryPost({
    title: values.title.trim(),
    body: values.body.trim(),
    categorySlug: values.categorySlug,
    imageUrls,
  });
}
