import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

type UserAvatarProps = {
  uri: string | null;
  size?: number;
  name?: string;
};

export function UserAvatar({ uri, size = 32, name }: UserAvatarProps) {
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri === null) {
    return (
      <View style={[styles.avatar, styles.placeholder, shape]} accessibilityLabel={name}>
        <Ionicons name="person" size={size * 0.55} color={colors.textTertiary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      accessibilityLabel={name}
      contentFit="cover"
      transition={150}
      style={[styles.avatar, shape]}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.surfaceMuted,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
