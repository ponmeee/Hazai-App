import type { PickedImage } from '@/features/uploads/pickImages';
import type { CategorySlug, ProductCondition, ShippingMethod } from '@/types/models';
import { formatNumber } from '@/utils/format';

export const MAX_LISTING_IMAGES = 6;
export const NAME_MAX_LENGTH = 40;
export const DESCRIPTION_MAX_LENGTH = 1000;
export const PRICE_MIN = 1;
export const PRICE_MAX = 9_999_999;

export type ListingFormValues = {
  images: PickedImage[];
  name: string;
  categorySlug: CategorySlug | null;
  size: string;
  weight: string;
  condition: ProductCondition | null;
  description: string;
  /** 入力途中の値も保持するため文字列で持ち、送信時に数値へ変換する */
  price: string;
  shippingMethods: ShippingMethod[];
  tags: string[];
};

export type ListingFormErrors = Partial<Record<keyof ListingFormValues, string>>;

export const initialListingFormValues: ListingFormValues = {
  images: [],
  name: '',
  categorySlug: null,
  size: '',
  weight: '',
  condition: null,
  description: '',
  price: '',
  shippingMethods: [],
  tags: [],
};

const toHalfWidthDigits = (value: string): string =>
  value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));

/** 全角数字・桁区切りカンマを許容して円単位の整数に変換する。不正な場合は null */
export const parsePrice = (raw: string): number | null => {
  const normalized = toHalfWidthDigits(raw).replace(/[,，]/g, '').trim();
  if (!/^\d+$/.test(normalized)) return null;
  return Number(normalized);
};

export const validateListing = (values: ListingFormValues): ListingFormErrors => {
  const errors: ListingFormErrors = {};

  const name = values.name.trim();
  if (name === '') {
    errors.name = '商品名を入力してください';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `商品名は${NAME_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.categorySlug === null) {
    errors.categorySlug = '素材カテゴリを選択してください';
  }

  const description = values.description.trim();
  if (description === '') {
    errors.description = '商品説明を入力してください';
  } else if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `商品説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`;
  }

  const price = parsePrice(values.price);
  if (values.price.trim() === '') {
    errors.price = '値段を入力してください';
  } else if (price === null) {
    errors.price = '値段は数字で入力してください';
  } else if (price < PRICE_MIN || price > PRICE_MAX) {
    errors.price = `値段は${PRICE_MIN}〜${formatNumber(PRICE_MAX)}円の範囲で入力してください`;
  }

  if (values.shippingMethods.length === 0) {
    errors.shippingMethods = '配送方法を1つ以上選択してください';
  }

  if (values.images.length > MAX_LISTING_IMAGES) {
    errors.images = `画像は${MAX_LISTING_IMAGES}枚までです`;
  }

  return errors;
};
