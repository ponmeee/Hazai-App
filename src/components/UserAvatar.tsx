import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

type UserAvatarProps = {
  uri: string;
  size?: number;
  name?: string;
};

export function UserAvatar({ uri, size = 32, name }: UserAvatarProps) {
  return (
    <Image
      source={{ uri }}
      accessibilityLabel={name}
      contentFit="cover"
      transition={150}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.surfaceMuted,
  },
});
