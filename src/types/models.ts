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
  /** 同梱画像（require の戻り値）または画像 URL */
  heroImage: number | string;
};

export type UserSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string;
  genre: string;
};

export type UserProfile = UserSummary & {
  bio: string;
  followerCount: number;
  followingCount: number;
  likeCount: number;
};

/** ログイン中の本人の情報 */
export type Account = UserProfile & {
  email: string;
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
  size: string | null;
  weight: string | null;
  condition: ProductCondition | null;
  shippingMethods: ShippingMethod[];
  favoriteCount: number;
  createdAt: string;
  seller: UserSummary;
};

export type GalleryPost = {
  id: string;
  title: string;
  body: string;
  /** 一覧に表示する1枚目。imageUrls[0] と同じ */
  imageUrl: string;
  imageUrls: string[];
  categorySlug: CategorySlug;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: UserSummary;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  otherUser: UserSummary;
  product: { id: string; name: string; price: number; imageUrl: string | null } | null;
  lastMessage: Message | null;
  updatedAt: string;
};
