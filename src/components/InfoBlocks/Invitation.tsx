import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

export const InvitationTooltip: React.FC = () => {
  const { typography } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>
        How invitations work
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        You can invite users to your event — but only those who follow you.
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        Once you send an invitation, the user can either <Text style={{ fontWeight: '600' }}>accept</Text> or <Text style={{ fontWeight: '600' }}>decline</Text> it.
      </Text>

      <Spacer size="xs" />

      <Text style={typography.body}>
        You’ll be able to see their response status on this page.
      </Text>
    </View>
  );
};
