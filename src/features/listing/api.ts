import { createProduct } from '@/features/products/api';
import { uploadImages } from '@/features/uploads/api';
import type { Product } from '@/types/models';

import { parsePrice, type ListingFormValues } from './validateListing';

const toOptionalText = (value: string): string | null => (value.trim() === '' ? null : value.trim());

/** 画像をアップロードしてから、その URL を付けて商品を登録する */
export async function submitListing(values: ListingFormValues): Promise<Product> {
  const price = parsePrice(values.price);
  if (values.categorySlug === null || price === null) {
    throw new Error('submitListing は検証済みの入力で呼び出す');
  }

  const imageUrls = await uploadImages(values.images);

  return createProduct({
    name: values.name.trim(),
    categorySlug: values.categorySlug,
    size: toOptionalText(values.size),
    weight: toOptionalText(values.weight),
    condition: values.condition,
    description: values.description.trim(),
    price,
    shippingMethods: values.shippingMethods,
    imageUrls,
  });
}
