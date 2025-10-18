import React from 'react';
import { View, Text } from 'react-native';
import { Spacer } from 'rn-vs-lb';
import { useTheme } from 'rn-vs-lb/theme';

export const ParticipantsModerationTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.body}>
        If enabled, users will join the participant list but won\'t get chat access until you approve them. Declined requests will be removed automatically. Once turned on, participant moderation cannot be disabled later. When editing the event, this switch will be locked.
      </Text>
      <Spacer size="xs" />
    </View>
  );
};
