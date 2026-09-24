import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';

import { AuthProvider } from '@/features/auth/AuthProvider';
import { RealtimeMessageSync } from '@/features/messages/RealtimeMessageSync';
import { useAppFonts } from '@/hooks/useAppFonts';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { colors, layout } from '@/theme';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  const isFontReady = useAppFonts();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RealtimeMessageSync />
        <View style={styles.backdrop}>
          <View style={styles.app}>
            {/* フォント読み込み前に描画すると、一瞬システムフォントで表示されてから切り替わるため待つ */}
            {!isSupabaseConfigured && (
              <ErrorState message="Supabase の接続設定がありません。EXPO_PUBLIC_SUPABASE_URL と EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY を設定してください（MANUAL_SETUP.md 参照）。" />
            )}
            {isSupabaseConfigured && isFontReady && (
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                }}
              />
            )}
          </View>
          <StatusBar style="dark" />
        </View>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});
