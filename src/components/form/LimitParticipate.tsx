import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Controller, useWatch } from 'react-hook-form';
import { useTheme } from 'rn-vs-lb/theme';
import TextInput from './TextInput';
import { InfoTooltip, Spacer } from 'rn-vs-lb';
import { ParticipantLimitTooltip } from '../InfoBlocks/ParticipantLimit';

export interface LimitParticipateProps {
  control: any;
  label: string;
  name: string;
}

const LimitParticipate: React.FC<LimitParticipateProps> = ({ control, label, name }) => {
  const { theme, formStyles } = useTheme();
  const limitEnabled = useWatch({ control, name: 'limitParticipants' });

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={formStyles.label}>{label}</Text>
          <InfoTooltip style={{ marginLeft: 2, top: -3 }} content={<ParticipantLimitTooltip />} />
        </View>
        <Controller
          control={control}
          name={name}
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ false: theme.background4, true: theme.background4 }}
              thumbColor={value ? theme.primary : theme.black}
            />
          )}
        />
      </View>
      {limitEnabled && (
        <>
          <Spacer />
          <TextInput
            name="maxParticipants"
            label="Maximum participants"
            placeholder="0"
            keyboardType="number-pad"
            control={control}
            rules={{ required: 'Required' }}
          />
        </>
      )}
    </>
  );
};

export default LimitParticipate;
