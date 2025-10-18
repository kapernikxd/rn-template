import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const ParticipantLimitTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.body}>
        This field allows you to set a maximum number of participants who can join the event. If the limit is reached, new participants will not be able to join.
      </Text>
      <Spacer size="xs" />
    </View>
  );
};
