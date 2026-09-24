import { StyleSheet, View } from 'react-native';

import { FormField } from '@/components/FormField';
import { FormInput } from '@/components/FormInput';
import { getCategories } from '@/features/categories/queries';
import {
  productConditionLabels,
  productConditions,
  shippingMethodLabels,
  shippingMethods,
} from '@/features/products/labels';
import { spacing } from '@/theme';
import type { ShippingMethod } from '@/types/models';

import type { useListingForm } from '../useListingForm';
import { DESCRIPTION_MAX_LENGTH, MAX_LISTING_IMAGES, NAME_MAX_LENGTH } from '../validateListing';
import { ChipSelector } from './ChipSelector';
import { ImagePickerField } from './ImagePickerField';

type ListingFormProps = Pick<ReturnType<typeof useListingForm>, 'values' | 'errors' | 'setField'> & {
  onImagePickError: (message: string) => void;
};

const categoryOptions = getCategories().map((category) => ({
  value: category.slug,
  label: category.name,
}));
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
        placeholder="例）杉の端材セット"
        maxLength={NAME_MAX_LENGTH}
        error={errors.name}
      />

      <FormField label="素材カテゴリ" required error={errors.categorySlug}>
        <ChipSelector
          options={categoryOptions}
          isSelected={(slug) => values.categorySlug === slug}
          onPress={(slug) => setField('categorySlug', slug)}
        />
      </FormField>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <FormInput
            label="サイズ"
            value={values.size}
            onChangeText={(text) => setField('size', text)}
            placeholder="例）30×10×2cm"
          />
        </View>
        <View style={styles.rowItem}>
          <FormInput
            label="重量"
            value={values.weight}
            onChangeText={(text) => setField('weight', text)}
            placeholder="例）約1.5kg"
          />
        </View>
      </View>

      <FormField label="状態">
        <ChipSelector
          options={conditionOptions}
          isSelected={(condition) => values.condition === condition}
          onPress={(condition) =>
            setField('condition', values.condition === condition ? null : condition)
          }
        />
      </FormField>

      <FormInput
        label="商品説明"
        required
        multiline
        value={values.description}
        onChangeText={(text) => setField('description', text)}
        placeholder="素材の種類、出た経緯、おすすめの使い道など"
        maxLength={DESCRIPTION_MAX_LENGTH}
        error={errors.description}
        hint={`${values.description.length}/${DESCRIPTION_MAX_LENGTH}`}
      />

      <FormInput
        label="値段（円）"
        required
        value={values.price}
        onChangeText={(text) => setField('price', text)}
        placeholder="例）1200"
        keyboardType="number-pad"
        inputMode="numeric"
        error={errors.price}
      />

      <FormField label="配送方法" required error={errors.shippingMethods} hint="複数選択できます">
        <ChipSelector
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
    gap: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
  },
});
