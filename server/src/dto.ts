import type { CategorySlug, ProductCondition, ShippingMethod } from './domain.ts';

/** API レスポンスの形。クライアントはこれを自前のドメイン型へ変換して使う */

export type UserSummaryDto = {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string;
  genre: string;
};

export type UserProfileDto = UserSummaryDto & {
  bio: string;
  followerCount: number;
  followingCount: number;
  likeCount: number;
};

export type AccountDto = UserProfileDto & {
  email: string;
};

export type ProductDto = {
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
  seller: UserSummaryDto;
};

export type GalleryPostDto = {
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
  author: UserSummaryDto;
};

export type MessageDto = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type ConversationDto = {
  id: string;
  otherUser: UserSummaryDto;
  product: { id: string; name: string; price: number; imageUrl: string | null } | null;
  lastMessage: MessageDto | null;
  updatedAt: string;
};

export type AuthResponseDto = {
  token: string;
  account: AccountDto;
};

export type RealtimeEventDto = { type: 'ready' } | { type: 'message.created'; message: MessageDto };
