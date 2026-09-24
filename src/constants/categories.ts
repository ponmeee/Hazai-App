import type { Category } from '@/types/models';

const unsplash = (photoId: string, width: number): string =>
  `https://images.unsplash.com/photo-${photoId}?w=${width}&q=75&auto=format&fit=crop`;

export const categories: Category[] = [
  { slug: 'wood', name: '木材', heroImage: require('../../assets/images/categories/wood.png') },
  { slug: 'glass', name: 'ガラス', heroImage: require('../../assets/images/categories/glass.png') },
  { slug: 'fabric', name: '布', heroImage: unsplash('1528458909336-e7a0adfed0a5', 1200) },
  { slug: 'acrylic', name: 'アクリル', heroImage: unsplash('1509343256512-d77a5cb3791b', 1200) },
  { slug: 'leather', name: '革', heroImage: unsplash('1473188588951-666fce8e7c68', 1200) },
  { slug: 'metal', name: '金属', heroImage: require('../../assets/images/categories/metal.png') },
  { slug: 'paper', name: '紙', heroImage: require('../../assets/images/categories/paper.png') },
  { slug: 'other', name: 'その他', heroImage: unsplash('1452860606245-08befc0ff44b', 1200) },
];

export const homeHeroImageUrl = unsplash('1597484661973-ee6cd0b6482c', 1200);
