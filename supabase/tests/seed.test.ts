import assert from 'node:assert/strict';
import { test } from 'node:test';

import { setupDatabase } from './harness.ts';

test('デモデータがマイグレーション後のスキーマに投入でき、RLS 越しに期待どおり見える', async () => {
  const h = await setupDatabase({ withSeed: true });

  const counts = await h.as(null, (tx) =>
    tx.query<{ profiles: number; listings: number; posts: number }>(
      `select
        (select count(*) from public.profiles)::int as profiles,
        (select count(*) from public.listings)::int as listings,
        (select count(*) from public.gallery_posts)::int as posts`,
    ),
  );
  assert.deepEqual(counts.rows[0], { profiles: 7, listings: 17, posts: 10 });

  const password = await h.db.query<{ ok: boolean }>(
    `select encrypted_password = extensions.crypt('hazai-demo', encrypted_password) as ok
     from auth.users where email = 'mio@demo.hazai.test'`,
  );
  assert.equal(password.rows[0]?.ok, true);

  const mio = 'd0000001-0000-4000-8000-000000000001';
  const conversations = await h.as(mio, (tx) =>
    tx.query<{ other_display_name: string }>('select other_display_name from public.get_my_conversations()'),
  );
  assert.deepEqual(conversations.rows.map((row) => row.other_display_name).sort(), ['山本 けんた', '高橋 さき']);
});
