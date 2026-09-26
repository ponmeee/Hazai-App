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
  /** ホームのカテゴリ一覧に出す丸い写真（同梱画像） */
  thumbnail: number;
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

/** active: 販売中 / sold: 売り切れ / hidden: 非公開（出品者のみ閲覧可） */
export type ProductStatus = 'active' | 'sold' | 'hidden';

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
  /** 「#」を除いた小文字のハッシュタグ */
  tags: string[];
  status: ProductStatus;
  favoriteCount: number;
  createdAt: string;
  seller: UserSummary;
};

/** 購入時点の商品名・価格・画像を残した明細。出品が削除されると productId は null になる */
export type OrderItem = {
  id: string;
  productId: string | null;
  name: string;
  price: number;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
};

/** 作品に使った端材。購入した出品から選んだものは productId を持つ（出品が削除されると null） */
export type GalleryMaterial = {
  id: string;
  productId: string | null;
  name: string;
  imageUrl: string | null;
  tags: string[];
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

export type GalleryComment = {
  id: string;
  postId: string;
  body: string;
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
