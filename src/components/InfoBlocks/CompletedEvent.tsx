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
        What happens after an event ends?
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        Completed events will be automatically <Text style={{ fontWeight: '600' }}>deleted after {DELETE_DURATION} days</Text>, along with all related data — including chats, media, messages, and the participant list.
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        Chats will become <Text style={{ fontWeight: '600' }}>inaccessible {CHAT_DURATION} days</Text> after the event ends.
      </Text>
    </View>
  );
};
