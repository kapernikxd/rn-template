import React from 'react';
import { View, Text } from 'react-native';
import { Spacer } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';

export const ParticipantsModerationTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.body}>
        Если включить модерацию, пользователи будут попадать в список участников, но не получат доступ к чату, пока вы их не одобрите. Отклонённые заявки удаляются автоматически. После активации отключить модерацию уже нельзя, а при редактировании события переключатель будет заблокирован.
      </Text>
      <Spacer size="xs" />
    </View>
  );
};
