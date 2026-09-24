import { createProduct, updateProduct, type ProductInput } from '@/features/products/api';
import { removeImages, uploadImages } from '@/lib/supabase/storage';
import type { Product } from '@/types/models';

import { parsePrice, type ListingFormValues } from './validateListing';

const toOptionalText = (value: string): string | null => (value.trim() === '' ? null : value.trim());

function toProductInput(values: ListingFormValues): ProductInput {
  const price = parsePrice(values.price);
  if (values.categorySlug === null || price === null) {
    throw new Error('検証済みの入力で呼び出すこと');
  }
  return {
    name: values.name.trim(),
    categorySlug: values.categorySlug,
    size: toOptionalText(values.size),
    weight: toOptionalText(values.weight),
    condition: values.condition,
    description: values.description.trim(),
    price,
    shippingMethods: values.shippingMethods,
  };
}

/** 画像を Storage へアップロードしてから商品を登録する。登録に失敗したら画像を片付ける */
export async function submitListing(values: ListingFormValues): Promise<Product> {
  const input = toProductInput(values);
  const imagePaths = await uploadImages('listing-images', values.images);
  try {
    return await createProduct(input, imagePaths);
  } catch (error) {
    await removeImages('listing-images', imagePaths);
    throw error;
  }
}

/** 商品情報を更新する（画像の差し替えは未対応） */
export const submitListingUpdate = (productId: string, values: ListingFormValues): Promise<Product> =>
  updateProduct(productId, toProductInput(values));
