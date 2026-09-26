import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { toAppError, unwrap } from '@/api/errors';
import { PROFILE_COLUMNS, PROFILE_STATS_COLUMNS, toAccount } from '@/api/mappers';
import { supabase } from '@/lib/supabase/client';
import { removeImages, uploadImage } from '@/lib/supabase/storage';
import type { PickedImage } from '@/features/uploads/pickImages';
import type { Account } from '@/types/models';

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  location: string;
  genre: string;
  bio: string;
};

export type ProfileInput = {
  name: string;
  location: string;
  genre: string;
  bio: string;
};

export type SignUpResult = {
  session: Session | null;
  /** メールアドレスの確認が必要な場合は true（確認リンクを開くまでログインできない） */
  needsEmailConfirmation: boolean;
};

/** 確認メールのリンクから戻る先。Supabase の Redirect URLs に登録しておく必要がある */
const getEmailRedirectUrl = (): string =>
  Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : Linking.createURL('/auth/callback');

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error !== null) throw toAppError(error);
  return data.session;
}

/** プロフィールの初期値は user_metadata として渡し、DB のトリガーが profiles を作成する */
export async function signUp(input: RegisterInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.name.trim(),
        location: input.location.trim(),
        genre: input.genre.trim(),
        bio: input.bio.trim(),
      },
      emailRedirectTo: getEmailRedirectUrl(),
    },
  });
  if (error !== null) throw toAppError(error);
  return { session: data.session, needsEmailConfirmation: data.session === null };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error !== null) throw toAppError(error);
}

export async function fetchAccount(user: Pick<User, 'id' | 'email'>): Promise<Account> {
  const [profile, stats] = await Promise.all([
    supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).single(),
    supabase.from('profile_stats').select(PROFILE_STATS_COLUMNS).eq('id', user.id).maybeSingle(),
  ]);
  return toAccount(unwrap(profile), stats.data, user.email ?? '');
}

async function requireUser(): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error !== null) throw toAppError(error);
  return data.user;
}

/** 本人のプロフィールのみ更新できる（RLS）。id はログイン中のユーザーから取る */
export async function updateProfile(input: ProfileInput): Promise<Account> {
  const user = await requireUser();
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.name.trim(),
      location: input.location.trim(),
      genre: input.genre.trim(),
      bio: input.bio.trim(),
    })
    .eq('id', user.id);
  if (error !== null) throw toAppError(error);
  return fetchAccount(user);
}

/** 新しいアバターを avatars/{user_id}/ にアップロードして差し替え、古い画像を消す */
export async function updateAvatar(image: PickedImage): Promise<Account> {
  const user = await requireUser();
  const { data: current } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
  const path = await uploadImage('avatars', image);

  const { error } = await supabase.from('profiles').update({ avatar_url: path }).eq('id', user.id);
  if (error !== null) {
    await removeImages('avatars', [path]);
    throw toAppError(error);
  }
  if (current?.avatar_url != null) await removeImages('avatars', [current.avatar_url]);
  return fetchAccount(user);
}
