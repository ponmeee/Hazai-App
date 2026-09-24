import { clearDatabase, isDatabaseEmpty, seedDatabase } from './seed.ts';

const shouldReset = process.argv.includes('--reset');

if (shouldReset) {
  clearDatabase();
} else if (!isDatabaseEmpty()) {
  console.log('データが既にあるため何もしません。作り直す場合は npm run seed -- --reset を実行してください。');
  process.exit(0);
}

await seedDatabase();
console.log('デモデータを投入しました。');
