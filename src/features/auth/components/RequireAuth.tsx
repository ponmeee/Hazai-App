import type { ReactNode } from 'react';

import { LoadingState } from '@/components/LoadingState';
import type { Account } from '@/types/models';

import { useAuth } from '../AuthProvider';
import { SignInPrompt } from './SignInPrompt';

type RequireAuthProps = {
  title?: string;
  description: string;
  children: (account: Account) => ReactNode;
};

/** 表示の出し分けのみ。データの保護はサーバー側の認可で行う */
export function RequireAuth({ title, description, children }: RequireAuthProps) {
  const auth = useAuth();
  if (auth.status === 'loading') return <LoadingState />;
  if (auth.status === 'signedOut') return <SignInPrompt title={title} description={description} />;
  return <>{children(auth.account)}</>;
}
