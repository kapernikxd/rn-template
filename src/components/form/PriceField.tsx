import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'rn-vs-lb/theme';
import TextInput from './TextInput';
import Select from './Select';
import { Spacer } from 'rn-vs-lb';

export interface PriceFieldProps {
  control: any;
}

const currencyOptions = [
  { label: 'RUB', value: 'RUB' },
  { label: 'EUR', value: 'EUR' },
  { label: 'USD', value: 'USD' },
  { label: 'RSD', value: 'RSD' },
];

const rangeOptions = [
  { labelKey: 'components.form.priceField.rangeOptions.from', value: 'FROM' },
  { labelKey: 'components.form.priceField.rangeOptions.to', value: 'UPTO' },
];

const PriceField: React.FC<PriceFieldProps> = ({ control }) => {
  const { theme, formStyles } = useTheme();
  const { t } = useTranslation();
  const priceEnabled = useWatch({ control, name: 'priceEnabled' });
  const donation = useWatch({ control, name: 'price.donation' });
  const localizedRangeOptions = React.useMemo(
    () => rangeOptions.map(({ labelKey, value }) => ({ label: t(labelKey), value })),
    [t],
  );

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={formStyles.label}>{t('components.form.priceField.priceToggle')}</Text>
        <Controller
          control={control}
          name="priceEnabled"
          render={({ field: { value, onChange } }) => (
            <Switch
              value={!!value}
              onValueChange={onChange}
              trackColor={{ false: theme.background4, true: theme.background4 }}
              thumbColor={value ? theme.primary : theme.black}
            />
          )}
        />
      </View>
      {priceEnabled && (
        <>
          <Spacer />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={formStyles.label}>{t('components.form.priceField.donationToggle')}</Text>
            <Controller
              control={control}
              name="price.donation"
              render={({ field: { value, onChange } }) => (
                <Switch
                  value={!!value}
                  onValueChange={onChange}
                  trackColor={{ false: theme.background4, true: theme.background4 }}
                  thumbColor={value ? theme.primary : theme.black}
                />
              )}
            />
          </View>
          {!donation && (
            <>
              <Spacer />
              <TextInput
                name="price.amount"
                label={t('components.form.priceField.amountLabel')}
                placeholder="0"
                keyboardType="number-pad"
                control={control}
                rules={{ required: t('components.form.priceField.validation.required') }}
              />
              <Spacer />
              <Select
                name="price.currency"
                label={t('components.form.priceField.currencyLabel')}
                placeholder={t('components.form.priceField.currencyPlaceholder')}
                options={currencyOptions}
                control={control}
                rules={{ required: t('components.form.priceField.validation.required') }}
              />
              <Spacer />
              <Select
                name="price.range"
                label={t('components.form.priceField.rangeLabel')}
                placeholder={t('components.form.priceField.rangePlaceholder')}
                options={localizedRangeOptions}
                control={control}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default PriceField;
