import type { TextStyle } from 'react-native';

import { fontWeights } from './fonts';

export const typography = {
  display: { fontSize: 24, lineHeight: 34, ...fontWeights.bold },
  title: { fontSize: 20, lineHeight: 28, ...fontWeights.bold },
  heading: { fontSize: 17, lineHeight: 24, ...fontWeights.bold },
  sectionTitle: { fontSize: 16, lineHeight: 22, ...fontWeights.bold },
  subheading: { fontSize: 15, lineHeight: 22, ...fontWeights.semiBold },
  body: { fontSize: 15, lineHeight: 23, ...fontWeights.regular },
  bodySmall: { fontSize: 13, lineHeight: 19, ...fontWeights.regular },
  input: { fontSize: 14, lineHeight: 20, ...fontWeights.regular },
  paragraph: { fontSize: 14, lineHeight: 21, ...fontWeights.regular },
  caption: { fontSize: 12, lineHeight: 16, ...fontWeights.regular },
  captionSmall: { fontSize: 11, lineHeight: 14, ...fontWeights.regular },
  label: { fontSize: 13, lineHeight: 18, ...fontWeights.semiBold },
  price: { fontSize: 15, lineHeight: 20, ...fontWeights.bold },
} as const satisfies Record<string, TextStyle>;
