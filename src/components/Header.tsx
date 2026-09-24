import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, typography } from '@/theme';
import { goBackOr } from '@/utils/navigation';

import { IconButton } from './IconButton';

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  left?: ReactNode;
  right?: ReactNode;
};

export function Header({ title, showBack = false, left, right }: HeaderProps) {
  if (showBack) {
    return (
      <View style={styles.container}>
        <View style={styles.side}>
          <IconButton icon="chevron-back" accessibilityLabel="戻る" onPress={() => goBackOr('/')} />
        </View>
        <Text style={styles.centerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.leading}>
        {left ?? (
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingX,
    backgroundColor: colors.background,
  },
  leading: {
    flex: 1,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  side: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  centerTitle: {
    ...typography.heading,
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
  },
});
