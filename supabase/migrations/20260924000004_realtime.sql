-- Realtime: 新着メッセージを購読できるようにする。
-- postgres_changes は RLS を適用して配信されるため、会話の参加者にだけ届く。
alter publication supabase_realtime add table public.messages;
