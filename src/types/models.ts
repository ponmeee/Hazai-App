export type CategorySlug =
  | 'wood'
  | 'glass'
  | 'fabric'
  | 'acrylic'
  | 'leather'
  | 'metal'
  | 'paper'
  | 'other';

export type Category = {
  slug: CategorySlug;
  name: string;
  heroImageUrl: string;
};

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  location: string;
  genre: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  likeCount: number;
};

export type ProductCondition = 'new' | 'likeNew' | 'good' | 'fair' | 'poor';

export type ShippingMethod = 'delivery' | 'post';

/** 金額は円単位の整数、日時は ISO 8601 文字列で保持する */
export type Product = {
  id: string;
  name: string;
  price: number;
  categorySlug: CategorySlug;
  imageUrls: string[];
  description: string;
  size?: string;
  weight?: string;
  condition: ProductCondition;
  shippingMethods: ShippingMethod[];
  sellerId: string;
  favoriteCount: number;
  createdAt: string;
};

export type GalleryPost = {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
  categorySlug: CategorySlug;
  authorId: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};
