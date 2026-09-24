import { randomUUID } from 'node:crypto';
import type { SQLInputValue } from 'node:sqlite';

import { execute, nowIso, queryAll, queryOne } from '../db/database.ts';
import type { CategorySlug, ProductCondition, ShippingMethod } from '../domain.ts';
import type { ProductDto } from '../dto.ts';
import { toUserSummary, userSummaryColumns, type UserSummaryRow } from './userColumns.ts';

type ProductRow = UserSummaryRow & {
  id: string;
  name: string;
  price: number;
  category_slug: CategorySlug;
  description: string;
  size: string | null;
  weight: string | null;
  condition: ProductCondition | null;
  shipping_methods: string;
  image_urls: string;
  favorite_count: number;
  created_at: string;
};

const PRODUCT_SELECT = `
  SELECT p.*, ${userSummaryColumns('u')}
  FROM products p JOIN users u ON u.id = p.seller_id`;

const toProduct = (row: ProductRow): ProductDto => ({
  id: row.id,
  name: row.name,
  price: row.price,
  categorySlug: row.category_slug,
  imageUrls: JSON.parse(row.image_urls) as string[],
  description: row.description,
  size: row.size,
  weight: row.weight,
  condition: row.condition,
  shippingMethods: JSON.parse(row.shipping_methods) as ShippingMethod[],
  favoriteCount: row.favorite_count,
  createdAt: row.created_at,
  seller: toUserSummary(row),
});

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export type ProductQuery = {
  categorySlug?: CategorySlug;
  keyword?: string;
  sellerId?: string;
  sort: 'newest' | 'popular';
  limit?: number;
};

export function listProducts(query: ProductQuery): ProductDto[] {
  const conditions: string[] = [];
  const params: Record<string, SQLInputValue> = { limit: query.limit ?? -1 };

  if (query.categorySlug !== undefined) {
    conditions.push('p.category_slug = :categorySlug');
    params.categorySlug = query.categorySlug;
  }
  if (query.sellerId !== undefined) {
    conditions.push('p.seller_id = :sellerId');
    params.sellerId = query.sellerId;
  }
  const keyword = query.keyword?.trim() ?? '';
  if (keyword !== '') {
    conditions.push(`(p.name LIKE :pattern ESCAPE '\\' OR p.description LIKE :pattern ESCAPE '\\')`);
    params.pattern = `%${escapeLike(keyword)}%`;
  }

  const where = conditions.length === 0 ? '' : `WHERE ${conditions.join(' AND ')}`;
  const orderBy =
    query.sort === 'popular' ? 'p.favorite_count DESC, p.created_at DESC' : 'p.created_at DESC';

  return queryAll<ProductRow>(`${PRODUCT_SELECT} ${where} ORDER BY ${orderBy} LIMIT :limit`, params).map(
    toProduct,
  );
}

export function findProductById(id: string): ProductDto | undefined {
  const row = queryOne<ProductRow>(`${PRODUCT_SELECT} WHERE p.id = :id`, { id });
  return row === undefined ? undefined : toProduct(row);
}

export const productExists = (id: string): boolean =>
  queryOne('SELECT 1 FROM products WHERE id = :id', { id }) !== undefined;

export type NewProduct = {
  name: string;
  price: number;
  categorySlug: CategorySlug;
  description: string;
  size: string | null;
  weight: string | null;
  condition: ProductCondition | null;
  shippingMethods: ShippingMethod[];
  imageUrls: string[];
};

export function insertProduct(sellerId: string, product: NewProduct, id: string = randomUUID()): string {
  execute(
    `INSERT INTO products (id, seller_id, name, price, category_slug, description, size, weight,
       condition, shipping_methods, image_urls, favorite_count, created_at)
     VALUES (:id, :sellerId, :name, :price, :categorySlug, :description, :size, :weight,
       :condition, :shippingMethods, :imageUrls, 0, :createdAt)`,
    {
      id,
      sellerId,
      name: product.name,
      price: product.price,
      categorySlug: product.categorySlug,
      description: product.description,
      size: product.size,
      weight: product.weight,
      condition: product.condition,
      shippingMethods: JSON.stringify(product.shippingMethods),
      imageUrls: JSON.stringify(product.imageUrls),
      createdAt: nowIso(),
    },
  );
  return id;
}
