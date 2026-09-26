import { useLocalSearchParams } from 'expo-router';

import { UserListScreen } from '@/features/users/components/UserListScreen';
import { useFollowers } from '@/features/users/hooks';

export default function FollowersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserListScreen title="フォロワー" emptyTitle="まだフォロワーはいません" query={useFollowers(id)} />;
}
