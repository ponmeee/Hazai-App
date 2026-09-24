import { StyleSheet, Text, View } from 'react-native';

import { ChipSelector } from '@/components/ChipSelector';
import { FormField } from '@/components/FormField';
import { FormInput } from '@/components/FormInput';
import { getCategoryOptions } from '@/features/categories/queries';
import {
  productConditionLabels,
  productConditions,
  shippingMethodLabels,
  shippingMethods,
} from '@/features/products/labels';
import { colors, fontWeights, spacing, typography } from '@/theme';
import type { ShippingMethod } from '@/types/models';
import { formatNumber } from '@/utils/format';

import type { useListingForm } from '../useListingForm';
import {
  DESCRIPTION_MAX_LENGTH,
  MAX_LISTING_IMAGES,
  NAME_MAX_LENGTH,
  PRICE_MAX,
  PRICE_MIN,
} from '../validateListing';
import { ImagePickerField } from './ImagePickerField';

type ListingFormProps = Pick<ReturnType<typeof useListingForm>, 'values' | 'errors' | 'setField'> & {
  onImagePickError: (message: string) => void;
};

const categoryOptions = getCategoryOptions();
const conditionOptions = productConditions.map((condition) => ({
  value: condition,
  label: productConditionLabels[condition],
}));
const shippingOptions = shippingMethods.map((method) => ({
  value: method,
  label: shippingMethodLabels[method],
}));

export function ListingForm({ values, errors, setField, onImagePickError }: ListingFormProps) {
  const toggleShippingMethod = (method: ShippingMethod) => {
    const next = values.shippingMethods.includes(method)
      ? values.shippingMethods.filter((current) => current !== method)
      : [...values.shippingMethods, method];
    setField('shippingMethods', next);
  };

  return (
    <View style={styles.container}>
      <ImagePickerField
        images={values.images}
        maxCount={MAX_LISTING_IMAGES}
        error={errors.images}
        onChange={(images) => setField('images', images)}
        onPickError={onImagePickError}
      />

      <FormInput
        label="商品名"
        required
        value={values.name}
        onChangeText={(text) => setField('name', text)}
        placeholder="例：無垢スギの切り落とし端材詰め合わせ"
        maxLength={NAME_MAX_LENGTH}
        error={errors.name}
      />

      <FormField label="素材カテゴリ" required error={errors.categorySlug}>
        <ChipSelector
          layout="scroll"
          options={categoryOptions}
          isSelected={(slug) => values.categorySlug === slug}
          onPress={(slug) => setField('categorySlug', slug)}
        />
      </FormField>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>商品の仕様・状態</Text>
        <FormInput
          label="寸法"
          labelVariant="sub"
          value={values.size}
          onChangeText={(text) => setField('size', text)}
          placeholder="例：約 H25cm × W30cm"
        />
        <FormInput
          label="重量"
          labelVariant="sub"
          value={values.weight}
          onChangeText={(text) => setField('weight', text)}
          placeholder="例：約1.5kg"
        />
        <FormField label="状態" labelVariant="sub">
          <ChipSelector
            options={conditionOptions}
            isSelected={(condition) => values.condition === condition}
            onPress={(condition) => setField('condition', values.condition === condition ? null : condition)}
          />
        </FormField>
      </View>

      <FormInput
        label="商品説明"
        required
        multiline
        value={values.description}
        onChangeText={(text) => setField('description', text)}
        placeholder="例：産地はどこか、何に使われる予定だったか"
        maxLength={DESCRIPTION_MAX_LENGTH}
        error={errors.description}
        hint={`${values.description.length}/${DESCRIPTION_MAX_LENGTH}`}
      />

      <FormInput
        label="値段"
        required
        value={values.price}
        onChangeText={(text) => setField('price', text)}
        placeholder={`¥ ${formatNumber(PRICE_MIN)}〜${formatNumber(PRICE_MAX)}`}
        keyboardType="number-pad"
        inputMode="numeric"
        error={errors.price}
      />

      <FormField label="配送方法" required error={errors.shippingMethods} hint="複数選択できます">
        <ChipSelector
          shape="square"
          options={shippingOptions}
          isSelected={(method) => values.shippingMethods.includes(method)}
          onPress={toggleShippingMethod}
        />
      </FormField>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    ...typography.label,
    ...fontWeights.bold,
    color: colors.textPrimary,
  },
});
