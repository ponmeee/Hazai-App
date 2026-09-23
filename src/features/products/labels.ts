import type { ProductCondition, ShippingMethod } from '@/types/models';

export const productConditionLabels: Record<ProductCondition, string> = {
  new: '新品・未使用',
  likeNew: '未使用に近い',
  good: '目立った傷なし',
  fair: 'やや傷あり',
  poor: '傷・汚れあり',
};

export const shippingMethodLabels: Record<ShippingMethod, string> = {
  delivery: '宅配',
  post: '郵便',
};

export const productConditions = Object.keys(productConditionLabels) as ProductCondition[];
export const shippingMethods = Object.keys(shippingMethodLabels) as ShippingMethod[];
