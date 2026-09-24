import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { getErrorMessage } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';

import { submitListing } from './api';
import {
  initialListingFormValues,
  validateListing,
  type ListingFormErrors,
  type ListingFormValues,
} from './validateListing';

export function useListingForm() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ListingFormValues>(initialListingFormValues);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const mutation = useMutation({
    mutationFn: submitListing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  });

  // 初回送信までは入力途中のエラーを出さず、送信後は入力に合わせて再検証する
  const errors: ListingFormErrors = hasAttemptedSubmit ? validateListing(values) : {};
  const hasErrors = Object.keys(errors).length > 0;

  const setField = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    setHasAttemptedSubmit(true);
    if (Object.keys(validateListing(values)).length > 0) return;
    mutation.mutate(values);
  };

  const reset = () => {
    setValues(initialListingFormValues);
    setHasAttemptedSubmit(false);
    mutation.reset();
  };

  return {
    values,
    errors,
    hasErrors,
    setField,
    submit,
    reset,
    isSubmitting: mutation.isPending,
    submitError: mutation.isError ? getErrorMessage(mutation.error) : null,
    createdProduct: mutation.data ?? null,
  };
}
