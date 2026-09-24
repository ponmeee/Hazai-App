import type { CategorySlug, ProductCondition, ShippingMethod } from '../domain.ts';

/** 開発用のデモアカウント共通パスワード。本番環境ではシードを投入しない */
export const DEMO_PASSWORD = 'hazai-demo';

const unsplash = (photoId: string, width = 800): string =>
  `https://images.unsplash.com/photo-${photoId}?w=${width}&q=75&auto=format&fit=crop`;

type SeedUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  location: string;
  genre: string;
  bio: string;
};

type SeedProduct = {
  id: string;
  sellerId: string;
  name: string;
  price: number;
  categorySlug: CategorySlug;
  imageUrls: string[];
  description: string;
  size: string;
  weight: string;
  condition: ProductCondition;
  shippingMethods: ShippingMethod[];
  favoriteCount: number;
  createdAt: string;
};

type SeedGalleryPost = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  /** 先頭が一覧に表示される */
  imageUrls: string[];
  categorySlug: CategorySlug;
  likeCount: number;
  commentCount: number;
  createdAt: string;
};

type SeedConversation = {
  productId: string;
  participantIds: [string, string];
  messages: { senderId: string; body: string; createdAt: string }[];
};

export const seedUsers: SeedUser[] = [
  {
    id: 'u1',
    email: 'mio@demo.hazai.test',
    name: '佐藤 みお',
    avatarUrl: unsplash('1535295972055-1c762f4483e5', 200),
    location: '東京都',
    genre: '木工・家具',
    bio: '美大で家具デザインを専攻しています。制作で出た端材を、次の誰かの素材に。小さなスツールや器を中心につくっています。',
  },
  {
    id: 'u2',
    email: 'saki@demo.hazai.test',
    name: '高橋 さき',
    avatarUrl: unsplash('1438761681033-6461ffad8d80', 200),
    location: '京都府',
    genre: 'ガラス工芸',
    bio: 'ステンドグラスと吹きガラスの作家です。',
  },
  {
    id: 'u3',
    email: 'kenta@demo.hazai.test',
    name: '山本 けんた',
    avatarUrl: unsplash('1500648767791-00dcc994a43e', 200),
    location: '長野県',
    genre: '木工',
    bio: '家具工房で働きながら小物をつくっています。',
  },
  {
    id: 'u4',
    email: 'yuto@demo.hazai.test',
    name: '中村 ゆうと',
    avatarUrl: unsplash('1507003211169-0a1dd7228f2d', 200),
    location: '大阪府',
    genre: '金属・アクセサリー',
    bio: '真鍮とシルバーでアクセサリーを制作。',
  },
  {
    id: 'u5',
    email: 'aya@demo.hazai.test',
    name: '小林 あや',
    avatarUrl: unsplash('1494790108377-be9c29b29330', 200),
    location: '福岡県',
    genre: 'テキスタイル',
    bio: 'リネンや古布を使った布小物をつくっています。',
  },
  {
    id: 'u6',
    email: 'hana@demo.hazai.test',
    name: '伊藤 はな',
    avatarUrl: unsplash('1575936123452-b67c3203c357', 200),
    location: '神奈川県',
    genre: 'ペーパークラフト',
    bio: '紙と色のコラージュ作品を制作しています。',
  },
  {
    id: 'u7',
    email: 'sou@demo.hazai.test',
    name: '渡辺 そう',
    avatarUrl: unsplash('1611095973763-414019e72400', 200),
    location: '北海道',
    genre: 'レザークラフト',
    bio: 'ヌメ革の財布や小物を手縫いでつくっています。',
  },
];

/** [フォローする人, フォローされる人] */
export const seedFollows: [string, string][] = [
  ['u1', 'u2'], ['u1', 'u3'], ['u1', 'u4'], ['u1', 'u5'], ['u1', 'u6'], ['u1', 'u7'],
  ['u2', 'u1'], ['u2', 'u5'], ['u2', 'u6'],
  ['u3', 'u1'], ['u3', 'u7'],
  ['u4', 'u1'], ['u4', 'u2'],
  ['u5', 'u1'], ['u5', 'u2'], ['u5', 'u6'],
  ['u6', 'u5'], ['u6', 'u2'],
  ['u7', 'u3'], ['u7', 'u1'],
];

export const seedProducts: SeedProduct[] = [
  {
    id: 'p1', sellerId: 'u3', name: '杉の端材セット', price: 1200, categorySlug: 'wood',
    imageUrls: [unsplash('1589939705384-5185137a7f0f'), unsplash('1504148455328-c376907d081c')],
    description: '棚の制作で出た杉材の端材です。長さはばらばらですが、小物づくりや試し削りにちょうど良いサイズです。',
    size: '約 5〜30cm × 9cm × 2cm（15本前後）', weight: '約 2.5kg', condition: 'good',
    shippingMethods: ['delivery'], favoriteCount: 42, createdAt: '2026-09-18T01:00:00.000Z',
  },
  {
    id: 'p2', sellerId: 'u1', name: 'ウォールナット無垢材 端材', price: 2800, categorySlug: 'wood',
    imageUrls: [unsplash('1558997519-83ea9252edf8')],
    description: 'キャビネット制作の残りです。木目がきれいな部分を選んでいます。',
    size: '30cm × 12cm × 2cm（4枚）', weight: '約 1.8kg', condition: 'likeNew',
    shippingMethods: ['delivery'], favoriteCount: 67, createdAt: '2026-09-20T05:30:00.000Z',
  },
  {
    id: 'p3', sellerId: 'u3', name: 'ヒノキ角材 小割り', price: 800, categorySlug: 'wood',
    imageUrls: [unsplash('1504148455328-c376907d081c')],
    description: '香りの良いヒノキの小割り材です。模型や小箱の制作に。',
    size: '20cm × 3cm × 3cm（10本）', weight: '約 0.8kg', condition: 'good',
    shippingMethods: ['delivery', 'post'], favoriteCount: 18, createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'p4', sellerId: 'u2', name: 'ステンドグラス用 色ガラス片', price: 1500, categorySlug: 'glass',
    imageUrls: [unsplash('1518895949257-7621c3c786d7')],
    description: 'ステンドグラス制作で余った色ガラスです。緑・琥珀・透明が中心です。エッジは処理していないので取り扱いにご注意ください。',
    size: '3〜10cm 角（約 30 片）', weight: '約 1.2kg', condition: 'good',
    shippingMethods: ['delivery'], favoriteCount: 55, createdAt: '2026-09-19T07:00:00.000Z',
  },
  {
    id: 'p5', sellerId: 'u2', name: '小さなガラス瓶 5本', price: 900, categorySlug: 'glass',
    imageUrls: [unsplash('1565193566173-7a0ee3dbe261')],
    description: '一輪挿しやアロマボトルに使える小瓶です。',
    size: '高さ 8〜12cm', weight: '約 0.6kg', condition: 'likeNew',
    shippingMethods: ['delivery'], favoriteCount: 23, createdAt: '2026-09-12T02:00:00.000Z',
  },
  {
    id: 'p6', sellerId: 'u5', name: 'リネン生地 はぎれ', price: 600, categorySlug: 'fabric',
    imageUrls: [unsplash('1528458909336-e7a0adfed0a5')],
    description: '生成りのリネンのはぎれです。コースターや巾着に。',
    size: '50cm × 40cm（3枚）', weight: '約 0.2kg', condition: 'new',
    shippingMethods: ['post'], favoriteCount: 31, createdAt: '2026-09-20T23:00:00.000Z',
  },
  {
    id: 'p7', sellerId: 'u5', name: '黒フェルト 端切れ', price: 400, categorySlug: 'fabric',
    imageUrls: [unsplash('1550684376-efcbd6e3f031')],
    description: '厚手 3mm のフェルトです。',
    size: '30cm × 30cm（2枚）', weight: '約 0.1kg', condition: 'new',
    shippingMethods: ['post'], favoriteCount: 9, createdAt: '2026-09-10T04:00:00.000Z',
  },
  {
    id: 'p8', sellerId: 'u5', name: 'コットン裏毛 はぎれ', price: 500, categorySlug: 'fabric',
    imageUrls: [unsplash('1620799140408-edc6dcb6d633')],
    description: 'スウェット制作の残りです。白のコットン裏毛。',
    size: '60cm × 45cm', weight: '約 0.2kg', condition: 'likeNew',
    shippingMethods: ['post'], favoriteCount: 12, createdAt: '2026-09-08T01:00:00.000Z',
  },
  {
    id: 'p9', sellerId: 'u4', name: 'カラーアクリル板 端材', price: 1000, categorySlug: 'acrylic',
    imageUrls: [unsplash('1509343256512-d77a5cb3791b')],
    description: 'レーザーカットで余ったアクリル板です。色はおまかせになります。',
    size: '5〜15cm 角、厚さ 3mm（約 20 枚）', weight: '約 0.9kg', condition: 'good',
    shippingMethods: ['delivery', 'post'], favoriteCount: 38, createdAt: '2026-09-17T06:00:00.000Z',
  },
  {
    id: 'p10', sellerId: 'u4', name: 'グラデーションアクリル板', price: 1400, categorySlug: 'acrylic',
    imageUrls: [unsplash('1618005182384-a83a8bd57fbe')],
    description: '偏光グラデーションのアクリル板です。',
    size: '20cm × 20cm × 2mm（3枚）', weight: '約 0.3kg', condition: 'new',
    shippingMethods: ['post'], favoriteCount: 27, createdAt: '2026-09-14T03:00:00.000Z',
  },
  {
    id: 'p11', sellerId: 'u7', name: 'ヌメ革 ハギレ', price: 1800, categorySlug: 'leather',
    imageUrls: [unsplash('1473188588951-666fce8e7c68')],
    description: '財布制作の残りのヌメ革です。キーホルダーやカードケースに。',
    size: '10〜25cm（約 10 枚）', weight: '約 0.5kg', condition: 'good',
    shippingMethods: ['delivery', 'post'], favoriteCount: 49, createdAt: '2026-09-22T01:00:00.000Z',
  },
  {
    id: 'p12', sellerId: 'u7', name: 'レザー端切れ ブラック', price: 1300, categorySlug: 'leather',
    imageUrls: [unsplash('1547949003-9792a18a2601')],
    description: 'バッグ制作で出た牛革の端切れです。',
    size: '10〜20cm（約 8 枚）', weight: '約 0.4kg', condition: 'fair',
    shippingMethods: ['post'], favoriteCount: 14, createdAt: '2026-09-11T08:00:00.000Z',
  },
  {
    id: 'p13', sellerId: 'u4', name: '真鍮・ステンレス端材', price: 2000, categorySlug: 'metal',
    imageUrls: [unsplash('1504917595217-d4dc5ebe6122')],
    description: 'アクセサリー制作で余った真鍮板とステンレス線のセットです。',
    size: '板 5cm 角前後、線 φ1mm', weight: '約 0.7kg', condition: 'good',
    shippingMethods: ['delivery'], favoriteCount: 33, createdAt: '2026-09-16T00:30:00.000Z',
  },
  {
    id: 'p14', sellerId: 'u4', name: 'ステンレスパイプ 切れ端', price: 1600, categorySlug: 'metal',
    imageUrls: [unsplash('1513828583688-c52646db42da')],
    description: '什器制作の残りのステンレスパイプです。',
    size: '長さ 20〜40cm、φ19mm（6本）', weight: '約 2.2kg', condition: 'fair',
    shippingMethods: ['delivery'], favoriteCount: 7, createdAt: '2026-09-05T05:00:00.000Z',
  },
  {
    id: 'p15', sellerId: 'u6', name: '和紙 端紙セット', price: 500, categorySlug: 'paper',
    imageUrls: [unsplash('1586075010923-2dd4570fb338')],
    description: '手漉き和紙の端紙です。ちぎり絵や封筒づくりに。',
    size: 'A5〜A4 程度（約 20 枚）', weight: '約 0.1kg', condition: 'good',
    shippingMethods: ['post'], favoriteCount: 21, createdAt: '2026-09-13T01:00:00.000Z',
  },
  {
    id: 'p16', sellerId: 'u6', name: '画用紙 あまり', price: 300, categorySlug: 'paper',
    imageUrls: [unsplash('1601662528567-526cd06f6582')],
    description: '白の画用紙です。少し角折れがあります。',
    size: 'B4（15 枚）', weight: '約 0.3kg', condition: 'fair',
    shippingMethods: ['post'], favoriteCount: 5, createdAt: '2026-09-09T10:00:00.000Z',
  },
  {
    id: 'p17', sellerId: 'u3', name: 'クラフト道具とパーツの詰め合わせ', price: 2500, categorySlug: 'other',
    imageUrls: [unsplash('1581783898377-1c85bf937427')],
    description: '釘・ビス・金具など、工房整理で出たパーツ類です。',
    size: '箱 30cm × 20cm × 10cm', weight: '約 1.5kg', condition: 'good',
    shippingMethods: ['delivery'], favoriteCount: 16, createdAt: '2026-09-07T02:00:00.000Z',
  },
];

export const seedGalleryPosts: SeedGalleryPost[] = [
  {
    id: 'g1', authorId: 'u3', title: '杉の端材でつくったスツール',
    body: '棚の制作で余った杉材を集めて、小さなスツールにしました。脚の角度を何度も試して、ようやく安定する形に。',
    imageUrls: [
      unsplash('1503602642458-232111445657', 1000), unsplash('1506439773649-6e0eb8cfb237', 1000), unsplash('1589939705384-5185137a7f0f', 1000),
    ], categorySlug: 'wood',
    likeCount: 214, commentCount: 18, createdAt: '2026-09-22T11:00:00.000Z',
  },
  {
    id: 'g2', authorId: 'u2', title: 'ガラス片の一輪挿し',
    body: 'ステンドグラスの残りを溶着して、一輪挿しをつくりました。光が当たると机に色が落ちるのが好きです。',
    imageUrls: [
      unsplash('1518895949257-7621c3c786d7', 1000), unsplash('1565193566173-7a0ee3dbe261', 1000),
    ], categorySlug: 'glass',
    likeCount: 386, commentCount: 27, createdAt: '2026-09-21T09:00:00.000Z',
  },
  {
    id: 'g3', authorId: 'u1', title: 'ウォールナットのサイドテーブル',
    body: 'キャビネットの端材を天板に。脚はナラの残り材です。',
    imageUrls: [unsplash('1611486212557-88be5ff6f941', 1000)], categorySlug: 'wood',
    likeCount: 158, commentCount: 12, createdAt: '2026-09-20T03:00:00.000Z',
  },
  {
    id: 'g4', authorId: 'u6', title: 'アクリル絵具のフルイドアート',
    body: '余った絵具を混ぜて流したら、思いがけない模様に。',
    imageUrls: [unsplash('1557672172-298e090bd0f1', 1000)], categorySlug: 'acrylic',
    likeCount: 97, commentCount: 6, createdAt: '2026-09-19T12:00:00.000Z',
  },
  {
    id: 'g5', authorId: 'u7', title: 'ヌメ革のショルダーバッグ',
    body: 'ハギレをパッチワークして、ひとつのバッグに仕立てました。',
    imageUrls: [
      unsplash('1473188588951-666fce8e7c68', 1000), unsplash('1547949003-9792a18a2601', 1000),
    ], categorySlug: 'leather',
    likeCount: 263, commentCount: 21, createdAt: '2026-09-18T01:00:00.000Z',
  },
  {
    id: 'g6', authorId: 'u1', title: '端材の椅子、もう一脚',
    body: '工房に残っていたナラ材で。背もたれのカーブを削り出すのに三日かかりました。',
    imageUrls: [unsplash('1506439773649-6e0eb8cfb237', 1000)], categorySlug: 'wood',
    likeCount: 132, commentCount: 9, createdAt: '2026-09-16T06:00:00.000Z',
  },
  {
    id: 'g7', authorId: 'u6', title: '紙の切れ端でつくるウォールアート',
    body: '色紙の残りを額に入れて並べました。',
    imageUrls: [unsplash('1513519245088-0e12902e5a38', 1000)], categorySlug: 'paper',
    likeCount: 74, commentCount: 4, createdAt: '2026-09-14T00:00:00.000Z',
  },
  {
    id: 'g8', authorId: 'u5', title: 'はぎれのピローカバー',
    body: 'リネンのはぎれをつないでピローカバーに。',
    imageUrls: [
      unsplash('1616627561839-074385245ff6', 1000), unsplash('1528458909336-e7a0adfed0a5', 1000), unsplash('1550684376-efcbd6e3f031', 1000),
    ], categorySlug: 'fabric',
    likeCount: 145, commentCount: 11, createdAt: '2026-09-12T04:00:00.000Z',
  },
  {
    id: 'g9', authorId: 'u4', title: 'アクリル絵具の厚塗り',
    body: 'パレットに残った色だけで一枚描いてみました。',
    imageUrls: [unsplash('1605721911519-3dfeb3be25e7', 1000)], categorySlug: 'acrylic',
    likeCount: 88, commentCount: 5, createdAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'g10', authorId: 'u1', title: '端材の器',
    body: '小さな器をつくりました。釉薬の残りで色づけしています。',
    imageUrls: [unsplash('1610701596007-11502861dcfa', 1000)], categorySlug: 'other',
    likeCount: 201, commentCount: 15, createdAt: '2026-09-08T02:00:00.000Z',
  },
];

export const seedConversations: SeedConversation[] = [
  {
    productId: 'p2',
    participantIds: ['u2', 'u1'],
    messages: [
      {
        senderId: 'u2',
        body: 'はじめまして。ウォールナットの端材、まだありますか？ 小さなトレイをつくりたいと思っています。',
        createdAt: '2026-09-21T01:10:00.000Z',
      },
      {
        senderId: 'u1',
        body: 'ありがとうございます！まだあります。4枚セットでのお渡しになりますが大丈夫でしょうか？',
        createdAt: '2026-09-21T02:05:00.000Z',
      },
      {
        senderId: 'u2',
        body: '大丈夫です。ぜひ購入させてください。',
        createdAt: '2026-09-21T02:20:00.000Z',
      },
    ],
  },
  {
    productId: 'p1',
    participantIds: ['u1', 'u3'],
    messages: [
      {
        senderId: 'u1',
        body: '杉の端材セット、スツールの座面に使えそうな幅のものはありますか？',
        createdAt: '2026-09-19T09:00:00.000Z',
      },
      {
        senderId: 'u3',
        body: '幅9cmのものが中心ですが、2枚はぎにすれば座面にできますよ。',
        createdAt: '2026-09-19T10:30:00.000Z',
      },
    ],
  },
];
