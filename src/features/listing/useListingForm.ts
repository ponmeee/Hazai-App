import { queryKeys } from '@/api/queryKeys';
import { useSubmitForm } from '@/hooks/useSubmitForm';
import type { Product } from '@/types/models';

import { submitListing, submitListingUpdate } from './api';
import { initialListingFormValues, validateListing, type ListingFormValues } from './validateListing';

export function useListingForm() {
  const { result, ...form } = useSubmitForm({
    initialValues: initialListingFormValues,
    validate: validateListing,
    submit: submitListing,
    invalidateKey: queryKeys.products.all,
  });
  return { ...form, createdProduct: result };
}

const toFormValues = (product: Product): ListingFormValues => ({
  // 画像の差し替えは未対応のため、編集フォームでは扱わない
  images: [],
  name: product.name,
  categorySlug: product.categorySlug,
  size: product.size ?? '',
  weight: product.weight ?? '',
  condition: product.condition,
  description: product.description,
  price: String(product.price),
  shippingMethods: product.shippingMethods,
  tags: product.tags,
});

export function useEditListingForm(product: Product) {
  const { result, ...form } = useSubmitForm({
    initialValues: toFormValues(product),
    validate: validateListing,
    submit: (values: ListingFormValues) => submitListingUpdate(product.id, values),
    invalidateKey: queryKeys.products.all,
  });
  return { ...form, updatedProduct: result };
}
