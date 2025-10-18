import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'rn-vs-lb/theme';
import { Spacer } from 'rn-vs-lb';

type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface PostModerationInfoProps {
  currentStatus?: string;
  reason?: "image" | "content"
}

export const PostModerationInfo: React.FC<PostModerationInfoProps> = ({ currentStatus, reason }) => {
  const { typography, theme } = useTheme();

  return (
    <View>
      <Text style={typography.titleH5}>What does each status mean?</Text>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• PENDING</Text>
        <Text style={typography.body}>
          The post is awaiting review by a moderator. It is not yet visible to other users (except the author).
        </Text>
      </View>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• APPROVED</Text>
        <Text style={typography.body}>
          The post has been reviewed and approved by a moderator. It is publicly visible to users.
        </Text>
      </View>
      <Spacer size="xs" />

      <View>
        <Text style={typography.titleH6}>• REJECTED</Text>
        <Text style={typography.body}>
          The post has been reviewed and was rejected due to violating rules, containing inappropriate content, or not meeting quality standards.
        </Text>
      </View>

      {currentStatus && (
        <>
          <Spacer size="sm" />
          <Text style={typography.titleH6}>Your current status - <Text style={{color: currentStatus === 'REJECTED' ? theme.danger : currentStatus === 'PENDING' ? theme.warning : theme.success}}>{currentStatus}</Text></Text>
          {reason && <Text style={[typography.body, {textDecorationLine: "underline"}]}>{reason === 'image' ? 'One of the photos violates the guidelines. Please upload a different image.' : 'The event description violates the guidelines. Please update the text.'}</Text>}
        </>
      )}
    </View>
  );
};
