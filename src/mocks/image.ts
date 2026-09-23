export const unsplash = (photoId: string, width = 800): string =>
  `https://images.unsplash.com/photo-${photoId}?w=${width}&q=75&auto=format&fit=crop`;
