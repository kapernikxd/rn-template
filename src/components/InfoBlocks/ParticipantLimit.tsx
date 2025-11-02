import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const ParticipantLimitTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.body}>
        Это поле позволяет задать максимальное количество участников, которые могут присоединиться к событию. Когда лимит будет достигнут, новые пользователи не смогут подать заявку.
      </Text>
      <Spacer size="xs" />
    </View>
  );
};
