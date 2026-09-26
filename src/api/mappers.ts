import type { Tables } from '@/lib/supabase/database.types';
import { getPublicImageUrl, type StorageBucket } from '@/lib/supabase/storage';
import type {
  Account,
  CategorySlug,
  Conversation,
  GalleryComment,
  GalleryMaterial,
  GalleryPost,
  Message,
  Order,
  Product,
  ProductCondition,
  ProductStatus,
  ShippingMethod,
  UserProfile,
  UserSummary,
} from '@/types/models';

/**
 * DB の行（列名は snake_case、画像は Storage のパス）を、画面が使うドメイン型へ変換する。
 * 取得する列（select）と変換をこのファイルで対にしておき、どちらかだけが変わらないようにする。
 */

export const PROFILE_SUMMARY_COLUMNS = 'id, display_name, avatar_url, location, genre' as const;

export const LISTING_SELECT = `id, title, description, price, category, status, size, weight, condition,
  shipping_methods, tags, favorite_count, created_at,
  seller:profiles!listings_seller_id_fkey(${PROFILE_SUMMARY_COLUMNS}),
  listing_images(storage_path, sort_order)` as const;

export const GALLERY_MATERIAL_COLUMNS = 'id, listing_id, name, image_bucket, image_path, tags' as const;

export const ORDER_SELECT = `id, total_price, created_at,
  order_items(id, listing_id, title, price, image_path)` as const;

export const GALLERY_POST_SELECT = `id, title, description, category, like_count, comment_count, created_at,
  author:profiles!gallery_posts_author_id_fkey(${PROFILE_SUMMARY_COLUMNS}),
  gallery_images(storage_path, sort_order)` as const;

export const MESSAGE_COLUMNS = 'id, conversation_id, sender_id, content, created_at' as const;

export const GALLERY_COMMENT_SELECT = `id, gallery_post_id, content, created_at,
  author:profiles!gallery_comments_author_id_fkey(${PROFILE_SUMMARY_COLUMNS})` as const;

type ProfileSummaryRow = Pick<Tables<'profiles'>, 'id' | 'display_name' | 'avatar_url' | 'location' | 'genre'>;
type ImageRow = { storage_path: string; sort_order: number };

export type ListingRow = Pick<
  Tables<'listings'>,
  | 'id'
  | 'title'
  | 'description'
  | 'price'
  | 'category'
  | 'size'
  | 'weight'
  | 'condition'
  | 'shipping_methods'
  | 'tags'
  | 'status'
  | 'favorite_count'
  | 'created_at'
> & { seller: ProfileSummaryRow; listing_images: ImageRow[] };

type GalleryMaterialRow = Pick<
  Tables<'gallery_post_materials'>,
  'id' | 'listing_id' | 'name' | 'image_bucket' | 'image_path' | 'tags'
>;

type OrderRow = Pick<Tables<'orders'>, 'id' | 'total_price' | 'created_at'> & {
  order_items: Pick<Tables<'order_items'>, 'id' | 'listing_id' | 'title' | 'price' | 'image_path'>[];
};

export type GalleryPostRow = Pick<
  Tables<'gallery_posts'>,
  'id' | 'title' | 'description' | 'category' | 'like_count' | 'comment_count' | 'created_at'
> & {
  author: ProfileSummaryRow;
  gallery_images: ImageRow[];
};

type GalleryCommentRow = Pick<Tables<'gallery_comments'>, 'id' | 'gallery_post_id' | 'content' | 'created_at'> & {
  author: ProfileSummaryRow;
};

type MessageRow = Pick<Tables<'messages'>, 'id' | 'conversation_id' | 'sender_id' | 'content' | 'created_at'>;

type ConversationRow = {
  id: string;
  updated_at: string;
  listing_id: string | null;
  listing_title: string | null;
  listing_price: number | null;
  listing_image_path: string | null;
  other_user_id: string;
  other_display_name: string;
  other_avatar_url: string | null;
  other_location: string;
  other_genre: string;
  last_message_id: string | null;
  last_message_sender_id: string | null;
  last_message_content: string | null;
  last_message_created_at: string | null;
};

const CATEGORY_SLUGS: readonly CategorySlug[] = ['wood', 'glass', 'fabric', 'acrylic', 'leather', 'metal', 'paper', 'other'];
const PRODUCT_CONDITIONS: readonly ProductCondition[] = ['new', 'likeNew', 'good', 'fair', 'poor'];
const SHIPPING_METHODS: readonly ShippingMethod[] = ['delivery', 'post'];
const PRODUCT_STATUSES: readonly ProductStatus[] = ['active', 'sold', 'hidden'];

// 値の範囲は DB の CHECK 制約で保証しているが、型を絞るためにここでも確認する
const toCategorySlug = (value: string): CategorySlug =>
  CATEGORY_SLUGS.find((slug) => slug === value) ?? 'other';
const toCondition = (value: string | null): ProductCondition | null =>
  PRODUCT_CONDITIONS.find((condition) => condition === value) ?? null;
// 不明な値は購入できない側（非公開）に倒す
const toProductStatus = (value: string): ProductStatus =>
  PRODUCT_STATUSES.find((status) => status === value) ?? 'hidden';
const toShippingMethods = (values: string[]): ShippingMethod[] =>
  SHIPPING_METHODS.filter((method) => values.includes(method));

const toImageUrls = (bucket: StorageBucket, images: ImageRow[]): string[] =>
  [...images].sort((a, b) => a.sort_order - b.sort_order).map((image) => getPublicImageUrl(bucket, image.storage_path));

export const toAvatarUrl = (path: string | null): string | null =>
  path === null ? null : getPublicImageUrl('avatars', path);

export const toUserSummary = (row: ProfileSummaryRow): UserSummary => ({
  id: row.id,
  name: row.display_name,
  avatarUrl: toAvatarUrl(row.avatar_url),
  location: row.location,
  genre: row.genre,
});

export const PROFILE_COLUMNS = `${PROFILE_SUMMARY_COLUMNS}, bio` as const;
export const PROFILE_STATS_COLUMNS = 'follower_count, following_count, like_count' as const;

type ProfileRow = ProfileSummaryRow & Pick<Tables<'profiles'>, 'bio'>;
type ProfileStatsRow = { follower_count: number | null; following_count: number | null; like_count: number | null };

export const toUserProfile = (profile: ProfileRow, stats: ProfileStatsRow | null): UserProfile => ({
  ...toUserSummary(profile),
  bio: profile.bio,
  followerCount: stats?.follower_count ?? 0,
  followingCount: stats?.following_count ?? 0,
  likeCount: stats?.like_count ?? 0,
});

export const toAccount = (profile: ProfileRow, stats: ProfileStatsRow | null, email: string): Account => ({
  ...toUserProfile(profile, stats),
  email,
});

export const toProduct = (row: ListingRow): Product => ({
  id: row.id,
  name: row.title,
  price: row.price,
  categorySlug: toCategorySlug(row.category),
  imageUrls: toImageUrls('listing-images', row.listing_images),
  description: row.description,
  size: row.size,
  weight: row.weight,
  condition: toCondition(row.condition),
  shippingMethods: toShippingMethods(row.shipping_methods),
  tags: row.tags,
  status: toProductStatus(row.status),
  favoriteCount: row.favorite_count,
  createdAt: row.created_at,
  seller: toUserSummary(row.seller),
});

export const toGalleryPost = (row: GalleryPostRow): GalleryPost => {
  const imageUrls = toImageUrls('gallery-images', row.gallery_images);
  return {
    id: row.id,
    title: row.title,
    body: row.description,
    imageUrl: imageUrls[0] ?? '',
    imageUrls,
    categorySlug: toCategorySlug(row.category),
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    author: toUserSummary(row.author),
  };
};

export const toGalleryComment = (row: GalleryCommentRow): GalleryComment => ({
  id: row.id,
  postId: row.gallery_post_id,
  body: row.content,
  createdAt: row.created_at,
  author: toUserSummary(row.author),
});

export const toMessage = (row: MessageRow): Message => ({
  id: row.id,
  conversationId: row.conversation_id,
  senderId: row.sender_id,
  body: row.content,
  createdAt: row.created_at,
});

export const toConversation = (row: ConversationRow): Conversation => ({
  id: row.id,
  otherUser: toUserSummary({
    id: row.other_user_id,
    display_name: row.other_display_name,
    avatar_url: row.other_avatar_url,
    location: row.other_location,
    genre: row.other_genre,
  }),
  product:
    row.listing_id === null || row.listing_title === null || row.listing_price === null
      ? null
      : {
          id: row.listing_id,
          name: row.listing_title,
          price: row.listing_price,
          imageUrl: row.listing_image_path === null ? null : getPublicImageUrl('listing-images', row.listing_image_path),
        },
  lastMessage:
    row.last_message_id === null ||
    row.last_message_sender_id === null ||
    row.last_message_content === null ||
    row.last_message_created_at === null
      ? null
      : toMessage({
          id: row.last_message_id,
          conversation_id: row.id,
          sender_id: row.last_message_sender_id,
          content: row.last_message_content,
          created_at: row.last_message_created_at,
        }),
  updatedAt: row.updated_at,
});

export const toOrder = (row: OrderRow): Order => ({
  id: row.id,
  totalPrice: row.total_price,
  createdAt: row.created_at,
  items: row.order_items.map((item) => ({
    id: item.id,
    productId: item.listing_id,
    name: item.title,
    price: item.price,
    imageUrl: item.image_path === null ? null : getPublicImageUrl('listing-images', item.image_path),
  })),
});

const toMaterialImageUrl = (bucket: string | null, path: string | null): string | null => {
  if (path === null) return null;
  return getPublicImageUrl(bucket === 'listing-images' ? 'listing-images' : 'gallery-images', path);
};

export const toGalleryMaterial = (row: GalleryMaterialRow): GalleryMaterial => ({
  id: row.id,
  productId: row.listing_id,
  name: row.name,
  imageUrl: toMaterialImageUrl(row.image_bucket, row.image_path),
  tags: row.tags,
});
