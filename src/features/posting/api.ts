import { createGalleryPost, type NewGalleryMaterialInput } from '@/features/gallery/api';
import { removeImages, uploadImages } from '@/lib/supabase/storage';
import type { GalleryPost } from '@/types/models';

import type { MaterialDraft, PostFormValues } from './validatePost';

const toMaterialInput = (material: MaterialDraft, imagePath: string | null): NewGalleryMaterialInput =>
  material.kind === 'purchased'
    ? { listingId: material.productId, name: material.name.trim() }
    : { name: material.name.trim(), imagePath, tags: material.tags };

/** 作品と使った端材の画像を Storage へアップロードしてから登録する。登録に失敗したら画像を片付ける */
export async function submitPost(values: PostFormValues): Promise<GalleryPost> {
  if (values.categorySlug === null) {
    throw new Error('submitPost は検証済みの入力で呼び出す');
  }

  const photoMaterials = values.materials.flatMap((material) => (material.kind === 'photo' ? [material] : []));
  const imagePaths = await uploadImages('gallery-images', values.images);
  let materialImagePaths: string[] = [];

  try {
    materialImagePaths = await uploadImages(
      'gallery-images',
      photoMaterials.map((material) => material.image),
    );
    const imagePathByKey = new Map(photoMaterials.map((material, index) => [material.key, materialImagePaths[index] ?? null]));
    return await createGalleryPost(
      { title: values.title.trim(), body: values.body.trim(), categorySlug: values.categorySlug },
      imagePaths,
      values.materials.map((material) => toMaterialInput(material, imagePathByKey.get(material.key) ?? null)),
    );
  } catch (error) {
    await removeImages('gallery-images', [...imagePaths, ...materialImagePaths]);
    throw error;
  }
}
