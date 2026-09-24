import { toAppError, unwrap } from '@/api/errors';
import { LISTING_SELECT, toProduct } from '@/api/mappers';
import { supabase } from '@/lib/supabase/client';
import type { Product } from '@/types/models';

export type CartItem = {
  id: string;
  quantity: number;
  product: Product;
};

const UNIQUE_VIOLATION = '23505';

/** RLS により自分のカートだけが返る。非公開になった商品（RLS で読めない）は除く */
export async function fetchCartItems(): Promise<CartItem[]> {
  const rows = unwrap(
    await supabase
      .from('cart_items')
      .select(`id, quantity, listing:listings(${LISTING_SELECT})`)
      .order('created_at', { ascending: false }),
  );
  return rows.flatMap((row) =>
    row.listing === null ? [] : [{ id: row.id, quantity: row.quantity, product: toProduct(row.listing) }],
  );
}

/** user_id は DB の既定値（auth.uid()）で決まるため送らない。追加済みなら成功とみなす */
export async function addToCart(listingId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').insert({ listing_id: listingId });
  if (error !== null && error.code !== UNIQUE_VIOLATION) throw toAppError(error);
}

export async function removeFromCart(listingId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('listing_id', listingId);
  if (error !== null) throw toAppError(error);
}
