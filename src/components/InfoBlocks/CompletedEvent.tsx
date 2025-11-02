import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

const DELETE_DURATION = 14;
const CHAT_DURATION = 5;

export const CompletedEventTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>
        Что происходит после завершения события?
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        Завершённые события автоматически <Text style={{ fontWeight: '600' }}>удаляются через {DELETE_DURATION} дней</Text> вместе со всеми связанными данными: чатами, медиа, сообщениями и списком участников.
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        Чаты станут <Text style={{ fontWeight: '600' }}>недоступны через {CHAT_DURATION} дней</Text> после завершения события.
      </Text>
    </View>
  );
};
