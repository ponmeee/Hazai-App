import type { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 24, lineHeight: 34, fontWeight: '700' },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 24, fontWeight: '700' },
  subheading: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' },
  bodySmall: { fontSize: 13, lineHeight: 19, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  price: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
} as const satisfies Record<string, TextStyle>;
