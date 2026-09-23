import type { ViewStyle } from 'react-native';

export const shadows = {
  card: { boxShadow: '0px 2px 10px rgba(31, 29, 26, 0.06)' },
  floating: { boxShadow: '0px -2px 12px rgba(31, 29, 26, 0.08)' },
} as const satisfies Record<string, ViewStyle>;
