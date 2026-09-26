import { toAppError, unwrap } from '@/api/errors';
import {
  PROFILE_COLUMNS,
  PROFILE_STATS_COLUMNS,
  PROFILE_SUMMARY_COLUMNS,
  toUserProfile,
  toUserSummary,
} from '@/api/mappers';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile, UserSummary } from '@/types/models';

const UNIQUE_VIOLATION = '23505';

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const [profile, stats] = await Promise.all([
    supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).single(),
    supabase.from('profile_stats').select(PROFILE_STATS_COLUMNS).eq('id', userId).maybeSingle(),
  ]);
  return toUserProfile(unwrap(profile), stats.data);
}

/** userId がフォローしている人（フォローした順） */
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

/** userId をフォローしている人（新しい順） */
export async function fetchFollowers(userId: string): Promise<UserSummary[]> {
  const rows = unwrap(
    await supabase
      .from('follows')
      .select(`follower:profiles!follows_follower_id_fkey(${PROFILE_SUMMARY_COLUMNS})`)
      .eq('followee_id', userId)
      .order('created_at', { ascending: false }),
  );
  return rows.map((row) => toUserSummary(row.follower));
}

/** follower_id は DB の既定値（auth.uid()）で決まるため送らない。フォロー済みなら成功とみなす */
export async function followUser(userId: string): Promise<void> {
  const { error } = await supabase.from('follows').insert({ followee_id: userId });
  if (error !== null && error.code !== UNIQUE_VIOLATION) throw toAppError(error);
}

/** 自分のフォローだけが RLS で削除できる */
export async function unfollowUser(userId: string): Promise<void> {
  const { error } = await supabase.from('follows').delete().eq('followee_id', userId);
  if (error !== null) throw toAppError(error);
}
