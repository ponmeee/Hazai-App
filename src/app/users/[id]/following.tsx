import { useLocalSearchParams } from 'expo-router';

import { UserListScreen } from '@/features/users/components/UserListScreen';
import { useFollowingOf } from '@/features/users/hooks';

export default function FollowingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserListScreen title="フォロー中" emptyTitle="まだ誰もフォローしていません" query={useFollowingOf(id)} />;
}
