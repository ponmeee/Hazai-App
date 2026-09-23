import { products } from '@/mocks/products';
import type { CategorySlug, Product } from '@/types/models';

type ProductFilter = {
  categorySlug?: CategorySlug;
  keyword?: string;
};

const matchesKeyword = (product: Product, keyword: string): boolean => {
  const normalized = keyword.trim().toLowerCase();
  if (normalized === '') return true;
  return (
    product.name.toLowerCase().includes(normalized) ||
    product.description.toLowerCase().includes(normalized)
  );
};

export const getProducts = ({ categorySlug, keyword = '' }: ProductFilter = {}): Product[] =>
  products.filter(
    (product) =>
      (categorySlug === undefined || product.categorySlug === categorySlug) &&
      matchesKeyword(product, keyword),
  );

export const getPopularProducts = (limit: number): Product[] =>
  [...products].sort((a, b) => b.favoriteCount - a.favoriteCount).slice(0, limit);

export const getProductById = (id: string): Product | undefined =>
  products.find((product) => product.id === id);

export const countProductsByCategory = (categorySlug: CategorySlug): number =>
  products.filter((product) => product.categorySlug === categorySlug).length;
