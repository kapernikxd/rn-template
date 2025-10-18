import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTheme } from 'rn-vs-lb/theme';
import { ParticipantsModerationTooltip } from '../InfoBlocks/ParticipantsModeration';
import { InfoTooltip } from 'rn-vs-lb';

interface ParticipantsModerationProps {
  control: any;
  name: string;
  label: string;
  disabled?: boolean;
}

const ParticipantsModeration: React.FC<ParticipantsModerationProps> = ({ control, name, label, disabled }) => {
  const { theme, formStyles } = useTheme();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={formStyles.label}>{label}</Text>
        <InfoTooltip style={{ marginLeft: 2, top: -2}} content={<ParticipantsModerationTooltip />} />
      </View>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <Switch
            value={!!value}
            onValueChange={onChange}
            trackColor={{ false: theme.background4, true: theme.background4 }}
            thumbColor={value ? theme.primary : theme.black}
            disabled={disabled}
          />
        )}
      />
    </View>
  );
};

export default ParticipantsModeration;
