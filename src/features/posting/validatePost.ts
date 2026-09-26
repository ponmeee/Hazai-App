import type { PickedImage } from '@/features/uploads/pickImages';
import type { CategorySlug } from '@/types/models';

export const MAX_POST_IMAGES = 4;
export const TITLE_MAX_LENGTH = 40;
export const BODY_MAX_LENGTH = 1000;
export const MAX_MATERIALS = 10;
export const MATERIAL_NAME_MAX_LENGTH = 40;

/**
 * 入力中の「使った端材」。key は並べ替え・削除のための画面上の識別子。
 * purchased: 購入履歴から選んだ出品（ハッシュタグは出品のものを引き継ぐ） / photo: 写真を撮って手入力したもの
 */
export type MaterialDraft =
  | { key: string; kind: 'purchased'; productId: string; name: string; imageUrl: string | null; tags: string[] }
  | { key: string; kind: 'photo'; image: PickedImage; name: string; tags: string[] };

export type PostFormValues = {
  images: PickedImage[];
  categorySlug: CategorySlug | null;
  title: string;
  body: string;
  materials: MaterialDraft[];
};

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>;

export const initialPostFormValues: PostFormValues = {
  images: [],
  categorySlug: null,
  title: '',
  body: '',
  materials: [],
};

export const validatePost = (values: PostFormValues): PostFormErrors => {
  const errors: PostFormErrors = {};

  if (values.images.length === 0) {
    errors.images = '写真を1枚以上追加してください';
  } else if (values.images.length > MAX_POST_IMAGES) {
    errors.images = `写真は${MAX_POST_IMAGES}枚までです`;
  }

  if (values.categorySlug === null) {
    errors.categorySlug = '素材カテゴリを選択してください';
  }

  const title = values.title.trim();
  if (title === '') {
    errors.title = 'タイトルを入力してください';
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.body.trim().length > BODY_MAX_LENGTH) {
    errors.body = `作品説明は${BODY_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.materials.length > MAX_MATERIALS) {
    errors.materials = `使用した端材は${MAX_MATERIALS}個まで登録できます`;
  } else if (values.materials.some((material) => material.name.trim() === '')) {
    errors.materials = '使用した端材の名前を入力してください';
  }

  return errors;
};
