import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/features/auth/AuthProvider';

import { fetchFollowingUsers } from './api';

export const useFollowingUsers = () => {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.viewer.following,
    queryFn: fetchFollowingUsers,
    enabled: status === 'signedIn',
  });
};
