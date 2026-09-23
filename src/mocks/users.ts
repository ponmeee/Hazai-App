import type { User } from '@/types/models';

import { unsplash } from './image';

export const currentUserId = 'u1';

export const users: User[] = [
  {
    id: 'u1',
    name: '佐藤 みお',
    avatarUrl: unsplash('1535295972055-1c762f4483e5', 200),
    location: '東京都',
    genre: '木工・家具',
    bio: '美大で家具デザインを専攻しています。制作で出た端材を、次の誰かの素材に。小さなスツールや器を中心につくっています。',
    followerCount: 128,
    followingCount: 86,
    likeCount: 1240,
  },
  {
    id: 'u2',
    name: '高橋 さき',
    avatarUrl: unsplash('1438761681033-6461ffad8d80', 200),
    location: '京都府',
    genre: 'ガラス工芸',
    bio: 'ステンドグラスと吹きガラスの作家です。',
    followerCount: 842,
    followingCount: 120,
    likeCount: 5320,
  },
  {
    id: 'u3',
    name: '山本 けんた',
    avatarUrl: unsplash('1500648767791-00dcc994a43e', 200),
    location: '長野県',
    genre: '木工',
    bio: '家具工房で働きながら小物をつくっています。',
    followerCount: 403,
    followingCount: 211,
    likeCount: 2890,
  },
  {
    id: 'u4',
    name: '中村 ゆうと',
    avatarUrl: unsplash('1507003211169-0a1dd7228f2d', 200),
    location: '大阪府',
    genre: '金属・アクセサリー',
    bio: '真鍮とシルバーでアクセサリーを制作。',
    followerCount: 256,
    followingCount: 98,
    likeCount: 1710,
  },
  {
    id: 'u5',
    name: '小林 あや',
    avatarUrl: unsplash('1494790108377-be9c29b29330', 200),
    location: '福岡県',
    genre: 'テキスタイル',
    bio: 'リネンや古布を使った布小物をつくっています。',
    followerCount: 612,
    followingCount: 305,
    likeCount: 4020,
  },
  {
    id: 'u6',
    name: '伊藤 はな',
    avatarUrl: unsplash('1575936123452-b67c3203c357', 200),
    location: '神奈川県',
    genre: 'ペーパークラフト',
    bio: '紙と色のコラージュ作品を制作しています。',
    followerCount: 190,
    followingCount: 144,
    likeCount: 980,
  },
  {
    id: 'u7',
    name: '渡辺 そう',
    avatarUrl: unsplash('1611095973763-414019e72400', 200),
    location: '北海道',
    genre: 'レザークラフト',
    bio: 'ヌメ革の財布や小物を手縫いでつくっています。',
    followerCount: 377,
    followingCount: 90,
    likeCount: 2310,
  },
];

export const followingUserIds: string[] = ['u2', 'u3', 'u4', 'u5', 'u6', 'u7'];
