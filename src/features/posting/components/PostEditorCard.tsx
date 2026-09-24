import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryTag } from '@/components/CategoryTag';
import type { IoniconName } from '@/components/IconButton';
import { PhotoCounterBadge } from '@/components/PhotoCounterBadge';
import { PhotoPager } from '@/components/PhotoPager';
import { PostAuthorMeta } from '@/components/PostAuthorMeta';
import { getCategoryName } from '@/features/categories/queries';
import { pickImagesFromLibrary } from '@/features/uploads/pickImages';
import { colors, fontWeights, layout, radius, spacing, typography } from '@/theme';
import type { UserSummary } from '@/types/models';

import type { usePostForm } from '../usePostForm';
import { BODY_MAX_LENGTH, MAX_POST_IMAGES, TITLE_MAX_LENGTH } from '../validatePost';

type PostEditorCardProps = Pick<ReturnType<typeof usePostForm>, 'values' | 'setField'> & {
  author: UserSummary;
  onImagePickError: (message: string) => void;
};

function OverlayButton({ icon, label, onPress }: { icon: IoniconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={spacing.xs}
      style={({ pressed }) => [styles.overlayButton, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={16} color={colors.textPrimary} />
    </Pressable>
  );
}

/** 投稿後のギャラリーの見た目のまま、写真・タイトル・説明を入力するカード */
export function PostEditorCard({ values, setField, author, onImagePickError }: PostEditorCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { images } = values;
  const hasPhotos = images.length > 0;
  const remaining = MAX_POST_IMAGES - images.length;

  const addImages = async () => {
    const result = await pickImagesFromLibrary(remaining);
    if (result === null) return;
    if (result.hasUnreadable) onImagePickError('読み込めなかった画像があります');
    setField('images', [...images, ...result.images].slice(0, MAX_POST_IMAGES));
  };

  const removeCurrentImage = () => {
    setField('images', images.filter((_, index) => index !== currentIndex));
    setCurrentIndex((index) => Math.max(0, Math.min(index, images.length - 2)));
  };

  return (
    <View style={styles.card}>
      <View style={[styles.photoArea, !hasPhotos && styles.photoAreaEmpty]}>
        {hasPhotos ? (
          <PhotoPager uris={images.map((image) => image.uri)} onIndexChange={setCurrentIndex} />
        ) : (
          <Pressable
            onPress={addImages}
            accessibilityRole="button"
            accessibilityLabel="写真を追加"
            style={({ pressed }) => [styles.emptyPicker, pressed && styles.pressed]}
          >
            <Ionicons name="camera-outline" size={24} color={colors.textTertiary} />
            <Text style={styles.emptyLabel}>写真を追加（{MAX_POST_IMAGES}枚まで）</Text>
          </Pressable>
        )}

        {values.categorySlug !== null && (
          <View style={styles.topLeft}>
            <CategoryTag label={getCategoryName(values.categorySlug)} tone={hasPhotos ? 'overlay' : 'muted'} />
          </View>
        )}

        {hasPhotos && (
          <View style={styles.topRight}>
            <PhotoCounterBadge index={currentIndex} total={images.length} />
            {remaining > 0 && <OverlayButton icon="add" label="写真を追加" onPress={addImages} />}
            <OverlayButton icon="trash-outline" label="表示中の写真を削除" onPress={removeCurrentImage} />
          </View>
        )}

        <View style={styles.bottomOverlay}>
          <PostAuthorMeta author={author} appearance={hasPhotos ? 'glass' : 'plain'} />
          {/* 投稿後にいいね・コメント数が表示される位置 */}
          <View style={[styles.engagementPlaceholder, hasPhotos && styles.engagementOnPhoto]} />
        </View>
      </View>

      <View style={styles.body}>
        <TextInput
          value={values.title}
          onChangeText={(text) => setField('title', text)}
          placeholder="タイトルを入力"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="タイトル"
          maxLength={TITLE_MAX_LENGTH}
          style={styles.titleInput}
        />
        <TextInput
          value={values.body}
          onChangeText={(text) => setField('body', text)}
          placeholder="作品説明"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="作品説明"
          maxLength={BODY_MAX_LENGTH}
          multiline
          style={styles.bodyInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  photoArea: {
    aspectRatio: layout.postPhotoAspectRatio,
    backgroundColor: colors.surface,
  },
  photoAreaEmpty: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textPrimary,
    backgroundColor: colors.background,
  },
  emptyPicker: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyLabel: {
    ...typography.bodySmall,
    ...fontWeights.semiBold,
    color: colors.textTertiary,
  },
  pressed: {
    opacity: 0.6,
  },
  topLeft: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  topRight: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  overlayButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
  },
  bottomOverlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    gap: spacing.md,
    // 写真のスライドや写真追加ボタンを、この領域越しに操作できるようにする
    pointerEvents: 'none',
  },
  engagementPlaceholder: {
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
  },
  engagementOnPhoto: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  body: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  // カードに直接書き込む見た目にするため、Web の入力欄の枠（フォーカスリング）を出さない
  titleInput: {
    ...typography.heading,
    outlineWidth: 0,
    color: colors.textPrimary,
  },
  bodyInput: {
    ...typography.input,
    minHeight: typography.input.lineHeight * 3,
    textAlignVertical: 'top',
    outlineWidth: 0,
    color: colors.textSecondary,
  },
});
