import { currentUserId, followingUserIds, users } from '@/mocks/users';
import type { User } from '@/types/models';

export const getUserById = (id: string): User | undefined => users.find((user) => user.id === id);

export const getCurrentUser = (): User => {
  const user = getUserById(currentUserId);
  if (user === undefined) throw new Error('Current user is missing from mock data');
  return user;
};

export const getFollowingUsers = (): User[] =>
  users.filter((user) => followingUserIds.includes(user.id));
