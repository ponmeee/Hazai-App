import type {
  Account,
  Conversation,
  GalleryPost,
  Message,
  Product,
  UserProfile,
  UserSummary,
} from '@/types/models';

import { resolveAssetUrl } from './config';
import type {
  AccountDto,
  ConversationDto,
  GalleryPostDto,
  MessageDto,
  ProductDto,
  UserProfileDto,
  UserSummaryDto,
} from './dto';

const resolveOptionalAssetUrl = (url: string | null): string | null =>
  url === null ? null : resolveAssetUrl(url);

export const toUserSummary = (dto: UserSummaryDto): UserSummary => ({
  ...dto,
  avatarUrl: resolveOptionalAssetUrl(dto.avatarUrl),
});

export const toUserProfile = (dto: UserProfileDto): UserProfile => ({
  ...dto,
  ...toUserSummary(dto),
});

export const toAccount = (dto: AccountDto): Account => ({
  ...toUserProfile(dto),
  email: dto.email,
});

export const toProduct = (dto: ProductDto): Product => ({
  ...dto,
  imageUrls: dto.imageUrls.map(resolveAssetUrl),
  seller: toUserSummary(dto.seller),
});

export const toGalleryPost = (dto: GalleryPostDto): GalleryPost => ({
  ...dto,
  imageUrl: resolveAssetUrl(dto.imageUrl),
  author: toUserSummary(dto.author),
});

export const toMessage = (dto: MessageDto): Message => ({ ...dto });

export const toConversation = (dto: ConversationDto): Conversation => ({
  id: dto.id,
  otherUser: toUserSummary(dto.otherUser),
  product:
    dto.product === null
      ? null
      : { ...dto.product, imageUrl: resolveOptionalAssetUrl(dto.product.imageUrl) },
  lastMessage: dto.lastMessage === null ? null : toMessage(dto.lastMessage),
  updatedAt: dto.updatedAt,
});
