import { toAppError, unwrap } from '@/api/errors';
import { supabase } from '@/lib/supabase/client';

const UNIQUE_VIOLATION = '23505';

/** RLS により自分のお気に入りだけが返る */
export async function fetchFavoriteProductIds(): Promise<string[]> {
  const rows = unwrap(await supabase.from('favorites').select('listing_id').order('created_at', { ascending: false }));
  return rows.map((row) => row.listing_id);
}

/** user_id は DB の既定値（auth.uid()）で決まるため送らない。登録済みなら成功とみなす */
export async function addFavorite(listingId: string): Promise<void> {
  const { error } = await supabase.from('favorites').insert({ listing_id: listingId });
  if (error !== null && error.code !== UNIQUE_VIOLATION) throw toAppError(error);
}

export async function removeFavorite(listingId: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete().eq('listing_id', listingId);
  if (error !== null) throw toAppError(error);
}
