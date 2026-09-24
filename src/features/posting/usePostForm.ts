import { queryKeys } from '@/api/queryKeys';
import { useSubmitForm } from '@/hooks/useSubmitForm';

import { submitPost } from './api';
import { initialPostFormValues, validatePost } from './validatePost';

export function usePostForm() {
  const { result, ...form } = useSubmitForm({
    initialValues: initialPostFormValues,
    validate: validatePost,
    submit: submitPost,
    invalidateKey: queryKeys.galleryPosts.all,
  });
  return { ...form, createdPost: result };
}
