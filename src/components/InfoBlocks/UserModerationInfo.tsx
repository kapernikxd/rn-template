import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface UserModerationInfoProps {
  currentStatus?: ModerationStatus;
  reason?: "image" | "content"
}

export const UserModerationInfo: React.FC<UserModerationInfoProps> = ({ currentStatus, reason }) => {
  const { typography, theme } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>What does each profile status mean?</Text>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• PENDING</Text>
        <Text style={typography.body}>
          Your profile is under review. You can access the app, but you cannot post content, create events, or interact with other users until your profile is approved.
        </Text>
      </View>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• APPROVED</Text>
        <Text style={typography.body}>
          Your profile has been approved. You have full access to all features: posting, chatting, creating or joining events.
        </Text>
      </View>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• REJECTED</Text>
        <Text style={typography.body}>
          Your profile was rejected due to violations of community guidelines or insufficient or inappropriate information. You may need to edit your profile and resubmit it for review.
        </Text>
      </View>

      {currentStatus && (
        <>
          <Spacer size="sm" />
          <Text style={typography.titleH6}>
            Your current status -{' '}
            <Text
              style={{
                color:
                  currentStatus === 'REJECTED'
                    ? theme.danger
                    : currentStatus === 'PENDING'
                    ? theme.warning
                    : theme.success,
              }}
            >
              {currentStatus}
            </Text>
          </Text>
          {reason && <Text style={[typography.body, {textDecorationLine: "underline"}]}>{reason === 'image' ? 'The photo violates the guidelines. Please upload a different image.' : 'Your profile information violates the guidelines. Please update your profile to meet the community standards.'}</Text>}
        </>
      )}
    </View>
  );
};
