import { unwrap } from '@/api/errors';
import { PROFILE_SUMMARY_COLUMNS, toUserSummary } from '@/api/mappers';
import { supabase } from '@/lib/supabase/client';
import type { UserSummary } from '@/types/models';

export async function fetchFollowingUsers(userId: string): Promise<UserSummary[]> {
  const rows = unwrap(
    await supabase
      .from('follows')
      .select(`followee:profiles!follows_followee_id_fkey(${PROFILE_SUMMARY_COLUMNS})`)
      .eq('follower_id', userId)
      .order('created_at'),
  );
  return rows.map((row) => toUserSummary(row.followee));
}
