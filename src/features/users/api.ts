import { apiRequest } from '@/api/client';
import type { UserSummaryDto } from '@/api/dto';
import { toUserSummary } from '@/api/mappers';
import type { UserSummary } from '@/types/models';

export const fetchFollowingUsers = async (): Promise<UserSummary[]> =>
  (await apiRequest<UserSummaryDto[]>('/me/following')).map(toUserSummary);
