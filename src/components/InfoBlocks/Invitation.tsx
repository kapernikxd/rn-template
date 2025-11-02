import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const InvitationTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>
        Как работают приглашения
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        Вы можете приглашать пользователей на своё событие, но только тех, кто подписан на вас.
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        После отправки приглашения пользователь может <Text style={{ fontWeight: '600' }}>принять</Text> или <Text style={{ fontWeight: '600' }}>отклонить</Text> его.
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        Статус ответа будет отображаться на этой странице.
      </Text>
    </View>
  );
};
