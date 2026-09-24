import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/features/auth/AuthProvider';

import { fetchFollowingUsers } from './api';

export const useFollowingUsers = () => {
  const { account } = useAuth();
  return useQuery({
    queryKey: queryKeys.viewer.following,
    queryFn: () => fetchFollowingUsers(account?.id ?? ''),
    enabled: account !== null,
  });
};
