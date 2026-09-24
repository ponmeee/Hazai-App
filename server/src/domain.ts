export const CATEGORY_SLUGS = [
  'wood',
  'glass',
  'fabric',
  'acrylic',
  'leather',
  'metal',
  'paper',
  'other',
] as const;

export const PRODUCT_CONDITIONS = ['new', 'likeNew', 'good', 'fair', 'poor'] as const;

export const SHIPPING_METHODS = ['delivery', 'post'] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export const PRODUCT_LIMITS = {
  nameMaxLength: 40,
  descriptionMaxLength: 1000,
  priceMin: 1,
  priceMax: 9_999_999,
  maxImages: 6,
} as const;

export const GALLERY_POST_LIMITS = {
  titleMaxLength: 40,
  bodyMaxLength: 1000,
  maxImages: 4,
} as const;
