import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useState } from 'react';

import { getErrorMessage } from '@/api/client';

type FormErrors<Values> = Partial<Record<keyof Values, string>>;

type UseSubmitFormOptions<Values, Result> = {
  initialValues: Values;
  validate: (values: Values) => FormErrors<Values>;
  submit: (values: Values) => Promise<Result>;
  /** 送信に成功したら再取得させる一覧 */
  invalidateKey: QueryKey;
};

/** 入力値の保持・検証・送信をまとめたフォームの状態 */
export function useSubmitForm<Values extends object, Result>({
  initialValues,
  validate,
  submit: submitValues,
  invalidateKey,
}: UseSubmitFormOptions<Values, Result>) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Values>(initialValues);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const mutation = useMutation({
    mutationFn: submitValues,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invalidateKey }),
  });

  // 初回送信までは入力途中のエラーを出さず、送信後は入力に合わせて再検証する
  const errors: FormErrors<Values> = hasAttemptedSubmit ? validate(values) : {};
  const hasErrors = Object.keys(errors).length > 0;

  const setField = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    setHasAttemptedSubmit(true);
    if (Object.keys(validate(values)).length > 0) return;
    mutation.mutate(values);
  };

  const reset = () => {
    setValues(initialValues);
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
    result: mutation.data ?? null,
  };
}
