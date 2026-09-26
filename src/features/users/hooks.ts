import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/features/auth/AuthProvider';

import { fetchFollowers, fetchFollowingUsers, fetchUserProfile, followUser, unfollowUser } from './api';

/** ログイン中の本人がフォローしている人 */
export const useFollowingUsers = () => {
  const { account } = useAuth();
  return useQuery({
    queryKey: queryKeys.viewer.following,
    queryFn: () => fetchFollowingUsers(account?.id ?? ''),
    enabled: account !== null,
  });
};

export const useUserProfile = (userId: string) =>
  useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () => fetchUserProfile(userId),
  });

export const useFollowers = (userId: string) =>
  useQuery({
    queryKey: queryKeys.users.followers(userId),
    queryFn: () => fetchFollowers(userId),
  });

export const useFollowingOf = (userId: string) =>
  useQuery({
    queryKey: queryKeys.users.following(userId),
    queryFn: () => fetchFollowingUsers(userId),
  });

/** その人をフォロー中かと、フォロー・解除の切り替え。未ログインならログイン画面へ */
export function useFollow(userId: string) {
  const { status, account, refreshAccount } = useAuth();
  const queryClient = useQueryClient();
  const { data: following } = useFollowingUsers();

  const mutation = useMutation({
    mutationFn: (follow: boolean) => (follow ? followUser(userId) : unfollowUser(userId)),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.viewer.following }),
        // フォロワー数・一覧が変わる
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
        refreshAccount(),
      ]),
  });

  const isFollowing = following?.some((user) => user.id === userId) ?? false;

  const toggle = (onError?: (error: unknown) => void) => {
    if (status !== 'signedIn') {
      router.push('/login');
      return;
    }
    mutation.mutate(!isFollowing, { onError });
  };

  return {
    isFollowing,
    /** 自分自身はフォローできない */
    canFollow: account?.id !== userId,
    isUpdating: mutation.isPending,
    toggle,
  };
}
