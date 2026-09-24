import { apiRequest } from '@/api/client';
import type { ProductDto } from '@/api/dto';
import { toProduct } from '@/api/mappers';
import type { ProductListFilter } from '@/api/queryKeys';
import type { CategorySlug, Product, ProductCondition, ShippingMethod } from '@/types/models';

export const fetchProducts = async ({ categorySlug, keyword }: ProductListFilter): Promise<Product[]> =>
  (await apiRequest<ProductDto[]>('/products', { query: { category: categorySlug, q: keyword } })).map(
    toProduct,
  );

export const fetchPopularProducts = async (limit: number): Promise<Product[]> =>
  (await apiRequest<ProductDto[]>('/products', { query: { sort: 'popular', limit } })).map(toProduct);

export const fetchProduct = async (id: string): Promise<Product> =>
  toProduct(await apiRequest<ProductDto>(`/products/${encodeURIComponent(id)}`));

export type NewProductInput = {
  name: string;
  categorySlug: CategorySlug;
  size: string | null;
  weight: string | null;
  condition: ProductCondition | null;
  description: string;
  price: number;
  shippingMethods: ShippingMethod[];
  /** サーバーへアップロード済みの画像パス */
  imageUrls: string[];
};

export const createProduct = async (input: NewProductInput): Promise<Product> =>
  toProduct(await apiRequest<ProductDto>('/products', { method: 'POST', body: input }));
