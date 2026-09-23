import type { Category } from '@/types/models';

import { unsplash } from './image';

export const categories: Category[] = [
  { slug: 'wood', name: '木材', heroImageUrl: unsplash('1589939705384-5185137a7f0f', 1200) },
  { slug: 'glass', name: 'ガラス', heroImageUrl: unsplash('1518895949257-7621c3c786d7', 1200) },
  { slug: 'fabric', name: '布', heroImageUrl: unsplash('1528458909336-e7a0adfed0a5', 1200) },
  { slug: 'acrylic', name: 'アクリル', heroImageUrl: unsplash('1509343256512-d77a5cb3791b', 1200) },
  { slug: 'leather', name: '革', heroImageUrl: unsplash('1473188588951-666fce8e7c68', 1200) },
  { slug: 'metal', name: '金属', heroImageUrl: unsplash('1504917595217-d4dc5ebe6122', 1200) },
  { slug: 'paper', name: '紙', heroImageUrl: unsplash('1586075010923-2dd4570fb338', 1200) },
  { slug: 'other', name: 'その他', heroImageUrl: unsplash('1452860606245-08befc0ff44b', 1200) },
];

export const homeHeroImageUrl = unsplash('1597484661973-ee6cd0b6482c', 1200);
