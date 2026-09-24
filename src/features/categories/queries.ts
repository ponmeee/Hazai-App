import { categories } from '@/constants/categories';
import type { Category, CategorySlug } from '@/types/models';

export const getCategories = (): Category[] => categories;

export const isCategorySlug = (value: string): value is CategorySlug =>
  categories.some((category) => category.slug === value);

export const getCategoryBySlug = (slug: string): Category | undefined =>
  categories.find((category) => category.slug === slug);

export const getCategoryName = (slug: CategorySlug): string =>
  getCategoryBySlug(slug)?.name ?? '';

/** フォームの選択肢（ChipSelector）用 */
export const getCategoryOptions = (): { value: CategorySlug; label: string }[] =>
  categories.map((category) => ({ value: category.slug, label: category.name }));
