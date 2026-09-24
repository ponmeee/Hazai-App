import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { getErrorMessage } from '@/api/errors';

import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

type QueryViewProps<T> = {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
};

/** 読み込み中・エラー・成功の表示分岐を各画面で繰り返さないためのラッパー */
export function QueryView<T>({ query, children }: QueryViewProps<T>) {
  if (query.isPending) return <LoadingState />;
  if (query.isError) {
    return <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  }
  return <>{children(query.data)}</>;
}
