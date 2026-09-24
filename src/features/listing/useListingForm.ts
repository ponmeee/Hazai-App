import { queryKeys } from '@/api/queryKeys';
import { useSubmitForm } from '@/hooks/useSubmitForm';

import { submitListing } from './api';
import { initialListingFormValues, validateListing } from './validateListing';

export function useListingForm() {
  const { result, ...form } = useSubmitForm({
    initialValues: initialListingFormValues,
    validate: validateListing,
    submit: submitListing,
    invalidateKey: queryKeys.products.all,
  });
  return { ...form, createdProduct: result };
}
