import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Controller, useWatch } from 'react-hook-form';
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
  { label: 'from', value: 'FROM' },
  { label: 'up to', value: 'UPTO' },
];

const PriceField: React.FC<PriceFieldProps> = ({ control }) => {
  const { theme, formStyles } = useTheme();
  const priceEnabled = useWatch({ control, name: 'priceEnabled' });
  const donation = useWatch({ control, name: 'price.donation' });

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={formStyles.label}>Price / Donation</Text>
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
            <Text style={formStyles.label}>Donation</Text>
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
                label="Amount"
                placeholder="0"
                keyboardType="number-pad"
                control={control}
                rules={{ required: 'Required' }}
              />
              <Spacer />
              <Select
                name="price.currency"
                label="Currency"
                placeholder="Currency"
                options={currencyOptions}
                control={control}
                rules={{ required: 'Required' }}
              />
              <Spacer />
              <Select
                name="price.range"
                label="Range"
                placeholder="Currency"
                options={rangeOptions}
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
