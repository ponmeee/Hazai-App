import { AppError, toAppError, unwrap } from '@/api/errors';
import { LISTING_SELECT, toProduct } from '@/api/mappers';
import type { ProductListFilter } from '@/api/queryKeys';
import { supabase } from '@/lib/supabase/client';
import { removeImages } from '@/lib/supabase/storage';
import type { CategorySlug, Product, ProductCondition, ShippingMethod } from '@/types/models';

// PostgREST の or() フィルタの区切り文字や LIKE のワイルドカードを検索語から取り除き、値を引用符で囲む
const toSearchPattern = (keyword: string | undefined): string | null => {
  const cleaned = (keyword ?? '').replace(/[%_*\\",().:]/g, ' ').trim();
  return cleaned === '' ? null : `"%${cleaned}%"`;
};

/** 一覧には販売中の商品だけを出す（自分の非公開商品も RLS 上は読めるため明示的に絞る） */
const activeListings = () => supabase.from('listings').select(LISTING_SELECT).eq('status', 'active');

export async function fetchProducts({ categorySlug, keyword }: ProductListFilter): Promise<Product[]> {
  let query = activeListings().order('created_at', { ascending: false });
  if (categorySlug !== undefined) query = query.eq('category', categorySlug);
  const pattern = toSearchPattern(keyword);
  if (pattern !== null) query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  return unwrap(await query).map(toProduct);
}

export async function fetchPopularProducts(limit: number): Promise<Product[]> {
  const query = activeListings()
    .order('favorite_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  return unwrap(await query).map(toProduct);
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data, error } = await supabase.from('listings').select(LISTING_SELECT).eq('id', id).maybeSingle();
  if (error !== null) throw toAppError(error);
  if (data === null) throw new AppError('商品が見つかりません');
  return toProduct(data);
}

export type ProductInput = {
  name: string;
  categorySlug: CategorySlug;
  size: string | null;
  weight: string | null;
  condition: ProductCondition | null;
  description: string;
  price: number;
  shippingMethods: ShippingMethod[];
};

/** 商品と画像（Storage にアップロード済みのパス）を 1 トランザクションで登録する */
export async function createProduct(input: ProductInput, imagePaths: string[]): Promise<Product> {
  const id = unwrap(
    await supabase.rpc('create_listing', {
      p_title: input.name,
      p_description: input.description,
      p_price: input.price,
      p_category: input.categorySlug,
      p_size: input.size,
      p_weight: input.weight,
      p_condition: input.condition,
      p_shipping_methods: input.shippingMethods,
      p_image_paths: imagePaths,
    }),
  );
  return fetchProduct(id);
}

/** 画像以外の項目を更新する。他人の商品は RLS により 0 件更新となる */
export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('listings')
    .update({
      title: input.name,
      description: input.description,
      price: input.price,
      category: input.categorySlug,
      size: input.size,
      weight: input.weight,
      condition: input.condition,
      shipping_methods: input.shippingMethods,
    })
    .eq('id', id)
    .select(LISTING_SELECT)
    .maybeSingle();
  if (error !== null) throw toAppError(error);
  if (data === null) throw new AppError('この商品は編集できません');
  return toProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const images = unwrap(await supabase.from('listing_images').select('storage_path').eq('listing_id', id));
  const deleted = unwrap(await supabase.from('listings').delete().eq('id', id).select('id'));
  if (deleted.length === 0) throw new AppError('この商品は削除できません');
  await removeImages(
    'listing-images',
    images.map((image) => image.storage_path),
  );
}
