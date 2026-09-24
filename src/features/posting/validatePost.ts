import type { PickedImage } from '@/features/uploads/pickImages';
import type { CategorySlug } from '@/types/models';

export const MAX_POST_IMAGES = 4;
export const TITLE_MAX_LENGTH = 40;
export const BODY_MAX_LENGTH = 1000;

export type PostFormValues = {
  images: PickedImage[];
  categorySlug: CategorySlug | null;
  title: string;
  body: string;
};

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>;

export const initialPostFormValues: PostFormValues = {
  images: [],
  categorySlug: null,
  title: '',
  body: '',
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

  return errors;
};
