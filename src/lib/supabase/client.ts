import './polyfills';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';

// EXPO_PUBLIC_ の値はビルド時に埋め込まれる。公開して問題ない URL と Publishable key のみを置くこと
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const isSupabaseConfigured = supabaseUrl !== '' && supabasePublishableKey !== '';

const isWeb = Platform.OS === 'web';

// 未設定でも import 時に落ちないよう仮の値で作り、画面側で設定エラーを表示する（isSupabaseConfigured）
export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl : 'http://localhost:54321',
  isSupabaseConfigured ? supabasePublishableKey : 'not-configured',
  {
    auth: {
      // Web はブラウザの localStorage（既定）、ネイティブは AsyncStorage にセッションを保存する
      storage: isWeb ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // メール確認リンクから戻ったとき、URL に含まれるトークンでログイン状態にする（Web のみ）
      detectSessionInUrl: isWeb,
    },
  },
);

// ネイティブではアプリが前面にある間だけトークンを自動更新する
if (!isWeb) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
