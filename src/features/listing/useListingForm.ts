import { useState } from 'react';

import {
  initialListingFormValues,
  validateListing,
  type ListingFormErrors,
  type ListingFormValues,
} from './validateListing';

export function useListingForm() {
  const [values, setValues] = useState<ListingFormValues>(initialListingFormValues);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 初回送信までは入力途中のエラーを出さず、送信後は入力に合わせて再検証する
  const errors: ListingFormErrors = hasAttemptedSubmit ? validateListing(values) : {};
  const hasErrors = Object.keys(errors).length > 0;

  const setField = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    setHasAttemptedSubmit(true);
    if (Object.keys(validateListing(values)).length > 0) return;
    // TODO: Supabase 接続時に出品データの保存処理へ置き換える
    setIsSubmitted(true);
  };

  const reset = () => {
    setValues(initialListingFormValues);
    setHasAttemptedSubmit(false);
    setIsSubmitted(false);
  };

  return { values, errors, hasErrors, isSubmitted, setField, submit, reset };
}
