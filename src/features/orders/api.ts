import { unwrap } from '@/api/errors';
import { LISTING_SELECT, ORDER_SELECT, toOrder, toProduct } from '@/api/mappers';
import { supabase } from '@/lib/supabase/client';
import type { Order, Product } from '@/types/models';

/** 購入確認画面に出す商品。売り切れも含めて返し、画面側で購入できるかを表示する */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const products = unwrap(await supabase.from('listings').select(LISTING_SELECT).in('id', ids)).map(toProduct);
  // 指定された順（カートの並び）を保つ
  return ids.flatMap((id) => products.filter((product) => product.id === id));
}

/** 指定した商品をまとめて購入し、作成された注文の ID を返す。売り切れが含まれていれば何も購入せずエラーになる */
export async function purchaseProducts(productIds: string[]): Promise<string> {
  return unwrap(await supabase.rpc('purchase_listings', { p_listing_ids: productIds }));
}

/** RLS により自分の購入だけが返る */
export async function fetchOrders(): Promise<Order[]> {
  return unwrap(
    await supabase.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false }),
  ).map(toOrder);
}
